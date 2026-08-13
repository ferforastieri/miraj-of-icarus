#include "BackendClient.h"
#include "GameProcess.h"
#include "ReleaseIntegrity.h"
#include "ReleaseUpdater.h"
#include "resource.h"
#include "miraj_of_icarus/client/LaunchContext.h"
#include "miraj_of_icarus/client/windows/WinHttpClient.h"

#include <windows.h>
#include <windowsx.h>
#include <commctrl.h>
#include <objidl.h>
#include <propidl.h>
using byte = unsigned char;
#include <gdiplus.h>
#include <shellapi.h>

#include <algorithm>
#include <array>
#include <cstring>
#include <exception>
#include <memory>
#include <stdexcept>
#include <string>
#include <string_view>
#include <vector>

namespace
{
constexpr COLORREF Iron = RGB(8, 39, 34);
constexpr COLORREF Moonsteel = RGB(239, 235, 209);
constexpr COLORREF Mist = RGB(184, 194, 174);
constexpr COLORREF Jade = RGB(52, 212, 132);
constexpr COLORREF AncientGold = RGB(190, 158, 80);
constexpr COLORREF Failure = RGB(197, 90, 98);

constexpr int UsernameId = 101;
constexpr int PasswordId = 102;
constexpr int ServerId = 103;
constexpr int PlayId = 104;
constexpr int MinimizeId = 105;
constexpr int CloseId = 106;
constexpr UINT LoadEnvironmentMessage = WM_APP + 1;

std::string LoadApiEndpoint()
{
    const std::string endpoint = MIRAJ_OF_ICARUS_PUBLIC_API_URL;
    const bool secure = endpoint.starts_with("https://");
    const bool local = endpoint.starts_with("http://localhost:") ||
        endpoint.starts_with("http://127.0.0.1:");
    if ((!secure && !local) || endpoint.ends_with('/'))
    {
        throw std::runtime_error("Launcher API endpoint is invalid.");
    }
    return endpoint;
}

void WriteDiagnostic(std::string_view message)
{
    const auto output = GetStdHandle(STD_OUTPUT_HANDLE);
    if (output == nullptr || output == INVALID_HANDLE_VALUE) return;
    DWORD written = 0;
    WriteFile(output, message.data(), static_cast<DWORD>(message.size()), &written, nullptr);
}

int RunDiagnostic(std::wstring_view command)
{
    try
    {
        const auto apiEndpoint = LoadApiEndpoint();
        if (command == L"--update-client")
        {
            WriteDiagnostic("client-update=authentication-required\n");
            return 4;
        }

        miraj_of_icarus::launcher::VerifyInstalledRelease(
            miraj_of_icarus::launcher::GameInstallDirectory());
        if (command == L"--verify-release")
        {
            WriteDiagnostic("release-integrity=ok\n");
            return 0;
        }

        const auto servers = miraj_of_icarus::launcher::BackendClient(apiEndpoint).GetServers();
        const auto available = std::any_of(
            servers.begin(), servers.end(), [](const auto& server) { return server.available; });
        if (!available)
        {
            WriteDiagnostic("release-integrity=ok backend=unavailable\n");
            return 3;
        }
        WriteDiagnostic("release-integrity=ok backend=ok\n");
        return 0;
    }
    catch (const std::exception& exception)
    {
        WriteDiagnostic(std::string("diagnostic=failed reason=") + exception.what() + "\n");
        return 2;
    }
}

struct WindowState
{
    HFONT displayFont = nullptr;
    HFONT brandFont = nullptr;
    HFONT bodyFont = nullptr;
    HFONT controlFont = nullptr;
    HFONT labelFont = nullptr;
    HFONT utilityFont = nullptr;
    HBRUSH editBrush = nullptr;
    HWND username = nullptr;
    HWND password = nullptr;
    HWND server = nullptr;
    HWND play = nullptr;
    HWND minimize = nullptr;
    HWND close = nullptr;
    std::unique_ptr<Gdiplus::Image> background;
    std::unique_ptr<Gdiplus::Image> mark;
    std::unique_ptr<Gdiplus::Image> frame;
    std::unique_ptr<Gdiplus::Image> buttonDefault;
    std::unique_ptr<Gdiplus::Image> buttonFocused;
    std::unique_ptr<Gdiplus::Image> buttonPressed;
    std::unique_ptr<Gdiplus::Image> buttonDisabled;
    std::unique_ptr<Gdiplus::Image> windowControls;
    std::vector<IStream*> resourceStreams;
    HANDLE privateFont = nullptr;
    std::vector<miraj_of_icarus::launcher::GameServer> servers;
    std::string apiEndpoint;
    std::wstring status = L"VERIFICANDO INSTALAÇÃO";
    std::wstring detail = L"Conferindo os arquivos locais assinados";
    int progress = 8;
    bool environmentReady = false;
    bool busy = true;
    bool launching = false;
    bool failed = false;
    int pulse = 0;
};

std::wstring ReadControl(HWND control)
{
    const auto length = GetWindowTextLengthW(control);
    std::wstring value(static_cast<std::size_t>(length) + 1, L'\0');
    GetWindowTextW(control, value.data(), static_cast<int>(value.size()));
    value.resize(static_cast<std::size_t>(length));
    return value;
}

void DrawTextLine(HDC dc, HFONT font, const wchar_t* text, RECT area, COLORREF color, UINT format)
{
    const auto oldFont = SelectObject(dc, font);
    SetTextColor(dc, color);
    SetBkMode(dc, TRANSPARENT);
    DrawTextW(dc, text, -1, &area, format);
    SelectObject(dc, oldFont);
}

std::unique_ptr<Gdiplus::GraphicsPath> RoundedPath(
    float left, float top, float right, float bottom, float radius)
{
    auto path = std::make_unique<Gdiplus::GraphicsPath>();
    const auto diameter = radius * 2.0F;
    path->AddArc(left, top, diameter, diameter, 180.0F, 90.0F);
    path->AddArc(right - diameter, top, diameter, diameter, 270.0F, 90.0F);
    path->AddArc(right - diameter, bottom - diameter, diameter, diameter, 0.0F, 90.0F);
    path->AddArc(left, bottom - diameter, diameter, diameter, 90.0F, 90.0F);
    path->CloseFigure();
    return path;
}

struct ResourceBytes
{
    const void* data = nullptr;
    DWORD size = 0;
};

ResourceBytes LoadResourceBytes(int resourceId)
{
    const auto instance = GetModuleHandleW(nullptr);
    const auto resource = FindResourceW(instance, MAKEINTRESOURCEW(resourceId), RT_RCDATA);
    if (resource == nullptr) return {};
    const auto loaded = LoadResource(instance, resource);
    if (loaded == nullptr) return {};
    return {LockResource(loaded), SizeofResource(instance, resource)};
}

void LoadEmbeddedImage(std::unique_ptr<Gdiplus::Image>& target, WindowState& state, int resourceId)
{
    const auto bytes = LoadResourceBytes(resourceId);
    if (bytes.data == nullptr || bytes.size == 0) return;
    const auto memory = GlobalAlloc(GMEM_MOVEABLE, bytes.size);
    if (memory == nullptr) return;
    const auto destination = GlobalLock(memory);
    if (destination == nullptr)
    {
        GlobalFree(memory);
        return;
    }
    std::memcpy(destination, bytes.data, bytes.size);
    GlobalUnlock(memory);
    IStream* stream = nullptr;
    if (CreateStreamOnHGlobal(memory, TRUE, &stream) != S_OK)
    {
        GlobalFree(memory);
        return;
    }
    auto image = std::make_unique<Gdiplus::Image>(stream);
    if (image->GetLastStatus() == Gdiplus::Ok)
    {
        state.resourceStreams.push_back(stream);
        target = std::move(image);
        return;
    }
    stream->Release();
}

void Refresh(HWND window, WindowState& state, std::wstring status, std::wstring detail,
    int progress, bool failed = false)
{
    state.status = std::move(status);
    state.detail = std::move(detail);
    state.progress = std::clamp(progress, 0, 100);
    state.failed = failed;
    InvalidateRect(window, nullptr, FALSE);
    UpdateWindow(window);
}

void UpdatePlayState(WindowState& state)
{
    const auto selected = static_cast<int>(SendMessageW(state.server, CB_GETCURSEL, 0, 0));
    const bool hasCredentials = !ReadControl(state.username).empty() && !ReadControl(state.password).empty();
    const bool enabled = state.environmentReady && !state.busy && hasCredentials && selected >= 0;
    EnableWindow(state.play, enabled);
    InvalidateRect(state.play, nullptr, TRUE);
}

void Layout(WindowState& state, int width, int height)
{
    constexpr int panelWidth = 400;
    const int panelLeft = width - panelWidth - 32;
    const int fieldLeft = panelLeft + 38;
    const int fieldWidth = panelWidth - 76;
    MoveWindow(state.server, fieldLeft, 222, fieldWidth, 44, TRUE);
    MoveWindow(state.username, fieldLeft + 1, 305, fieldWidth - 2, 42, TRUE);
    MoveWindow(state.password, fieldLeft + 1, 388, fieldWidth - 2, 42, TRUE);
    MoveWindow(state.play, width / 2 - 68, height - 190, 136, 142, TRUE);
    MoveWindow(state.minimize, width - 86, 18, 30, 28, TRUE);
    MoveWindow(state.close, width - 50, 18, 30, 28, TRUE);
    for (const auto control : {state.username, state.password, state.server})
    {
        RECT area{};
        GetClientRect(control, &area);
        SetWindowRgn(control, CreateRoundRectRgn(0, 0, area.right + 1, area.bottom + 1, 16, 16), TRUE);
    }
    SetWindowRgn(state.play, CreateEllipticRgn(0, 0, 136, 142), TRUE);
    (void)height;
}

LRESULT CALLBACK InputSubclass(HWND control, UINT message, WPARAM wParam, LPARAM lParam,
    UINT_PTR, DWORD_PTR)
{
    if (message == WM_SETFOCUS || message == WM_KILLFOCUS)
    {
        InvalidateRect(GetParent(control), nullptr, FALSE);
    }
    if (message == WM_KEYDOWN && wParam == VK_RETURN)
    {
        const auto play = GetDlgItem(GetParent(control), PlayId);
        if (IsWindowEnabled(play)) SendMessageW(play, BM_CLICK, 0, 0);
        return 0;
    }
    return DefSubclassProc(control, message, wParam, lParam);
}

LRESULT CALLBACK ComboSubclass(HWND control, UINT message, WPARAM wParam, LPARAM lParam,
    UINT_PTR, DWORD_PTR)
{
    if (message == WM_PAINT)
    {
        PAINTSTRUCT paint{};
        const auto dc = BeginPaint(control, &paint);
        RECT client{};
        GetClientRect(control, &client);
        const auto background = CreateSolidBrush(Iron);
        FillRect(dc, &client, background);
        DeleteObject(background);

        auto* state = reinterpret_cast<WindowState*>(
            GetWindowLongPtrW(GetParent(control), GWLP_USERDATA));
        if (state != nullptr)
        {
            const auto selected = static_cast<int>(SendMessageW(control, CB_GETCURSEL, 0, 0));
            wchar_t label[256]{};
            if (selected >= 0)
            {
                SendMessageW(control, CB_GETLBTEXT, selected, reinterpret_cast<LPARAM>(label));
            }
            RECT text{15, 0, client.right - 44, client.bottom};
            DrawTextLine(dc, state->controlFont, selected >= 0 ? label : L"Escolha um servidor",
                text, selected >= 0 ? Moonsteel : Mist,
                DT_LEFT | DT_SINGLELINE | DT_VCENTER | DT_END_ELLIPSIS);
            const auto pen = CreatePen(PS_SOLID, 2, GetFocus() == control ? Jade : AncientGold);
            const auto oldPen = SelectObject(dc, pen);
            MoveToEx(dc, client.right - 29, client.bottom / 2 - 3, nullptr);
            LineTo(dc, client.right - 22, client.bottom / 2 + 4);
            LineTo(dc, client.right - 15, client.bottom / 2 - 3);
            SelectObject(dc, oldPen);
            DeleteObject(pen);
        }
        EndPaint(control, &paint);
        return 0;
    }
    if (message == WM_ERASEBKGND || message == WM_NCPAINT) return 1;
    if (message == WM_SETFOCUS || message == WM_KILLFOCUS)
    {
        InvalidateRect(control, nullptr, FALSE);
        InvalidateRect(GetParent(control), nullptr, FALSE);
    }
    return DefSubclassProc(control, message, wParam, lParam);
}

void DrawBackground(Gdiplus::Graphics& graphics, WindowState& state, int width, int height)
{
    graphics.SetInterpolationMode(Gdiplus::InterpolationModeHighQualityBicubic);
    if (state.background != nullptr)
    {
        const auto imageWidth = static_cast<float>(state.background->GetWidth());
        const auto imageHeight = static_cast<float>(state.background->GetHeight());
        const auto destinationAspect = static_cast<float>(width) / static_cast<float>(height);
        const auto sourceAspect = imageWidth / imageHeight;
        float sourceX = 0.0F;
        float sourceY = 0.0F;
        float sourceWidth = imageWidth;
        float sourceHeight = imageHeight;
        if (sourceAspect > destinationAspect)
        {
            sourceWidth = imageHeight * destinationAspect;
            sourceX = (imageWidth - sourceWidth) / 2.0F;
        }
        else
        {
            sourceHeight = imageWidth / destinationAspect;
            sourceY = (imageHeight - sourceHeight) / 2.0F;
        }
        graphics.DrawImage(state.background.get(), Gdiplus::Rect(0, 0, width, height),
            sourceX, sourceY, sourceWidth, sourceHeight, Gdiplus::UnitPixel);
    }
    else
    {
        Gdiplus::SolidBrush fallback(Gdiplus::Color(255, 7, 11, 16));
        graphics.FillRectangle(&fallback, 0, 0, width, height);
    }

    Gdiplus::SolidBrush veil(Gdiplus::Color(36, 4, 17, 15));
    graphics.FillRectangle(&veil, 0, 0, width, height);
    Gdiplus::LinearGradientBrush sideShade(
        Gdiplus::Point(0, 0), Gdiplus::Point(width, 0),
        Gdiplus::Color(115, 4, 17, 15), Gdiplus::Color(20, 4, 17, 15));
    graphics.FillRectangle(&sideShade, 0, 0, width, height);
    Gdiplus::SolidBrush topBar(Gdiplus::Color(205, 4, 17, 15));
    graphics.FillRectangle(&topBar, 0, 0, width, 68);
    Gdiplus::SolidBrush bottomBar(Gdiplus::Color(230, 4, 17, 15));
    graphics.FillRectangle(&bottomBar, 0, height - 56, width, 56);
}

void DrawPanel(Gdiplus::Graphics& graphics, WindowState& state, int width, int height)
{
    constexpr int panelWidth = 400;
    const float left = static_cast<float>(width - panelWidth - 32);
    const float right = static_cast<float>(width - 32);
    const float top = 102.0F;
    const float bottom = static_cast<float>(height - 74);
    const auto panelPath = RoundedPath(left, top, right, bottom, 18.0F);
    Gdiplus::SolidBrush panel(Gdiplus::Color(236, 4, 39, 32));
    Gdiplus::Pen edge(Gdiplus::Color(225, 190, 158, 80), 1.5F);
    Gdiplus::Pen jadeEdge(Gdiplus::Color(185, 52, 212, 132), 1.0F);
    graphics.FillPath(&panel, panelPath.get());
    graphics.DrawPath(&edge, panelPath.get());
    graphics.DrawRectangle(&jadeEdge, static_cast<int>(left + 9), static_cast<int>(top + 9),
        static_cast<int>(right - left - 18), static_cast<int>(bottom - top - 18));

    if (state.frame != nullptr)
    {
        const int sourceWidth = static_cast<int>(state.frame->GetWidth());
        const int sourceHeight = static_cast<int>(state.frame->GetHeight());
        constexpr int sourceCornerX = 150;
        constexpr int sourceCornerY = 90;
        constexpr int corner = 34;
        auto draw = [&](int dx, int dy, int dw, int dh, int sx, int sy, int sw, int sh)
        {
            graphics.DrawImage(state.frame.get(), Gdiplus::Rect(dx, dy, dw, dh),
                sx, sy, sw, sh, Gdiplus::UnitPixel);
        };
        const int x = static_cast<int>(left);
        const int y = static_cast<int>(top);
        const int w = static_cast<int>(right - left);
        const int h = static_cast<int>(bottom - top);
        draw(x, y, corner, corner, 0, 0, sourceCornerX, sourceCornerY);
        draw(x + corner, y, w - corner * 2, corner, sourceCornerX, 0,
            sourceWidth - sourceCornerX * 2, sourceCornerY);
        draw(x + w - corner, y, corner, corner, sourceWidth - sourceCornerX, 0,
            sourceCornerX, sourceCornerY);
        draw(x, y + corner, corner, h - corner * 2, 0, sourceCornerY,
            sourceCornerX, sourceHeight - sourceCornerY * 2);
        draw(x + w - corner, y + corner, corner, h - corner * 2,
            sourceWidth - sourceCornerX, sourceCornerY, sourceCornerX,
            sourceHeight - sourceCornerY * 2);
        draw(x, y + h - corner, corner, corner, 0, sourceHeight - sourceCornerY,
            sourceCornerX, sourceCornerY);
        draw(x + corner, y + h - corner, w - corner * 2, corner,
            sourceCornerX, sourceHeight - sourceCornerY,
            sourceWidth - sourceCornerX * 2, sourceCornerY);
        draw(x + w - corner, y + h - corner, corner, corner,
            sourceWidth - sourceCornerX, sourceHeight - sourceCornerY,
            sourceCornerX, sourceCornerY);
    }

    const float fieldLeft = left + 38.0F;
    const float fieldRight = right - 38.0F;
    const std::array<std::pair<float, float>, 3> fields{{{220.0F, 268.0F}, {303.0F, 349.0F}, {386.0F, 432.0F}}};
    for (std::size_t index = 0; index < fields.size(); ++index)
    {
        const auto path = RoundedPath(fieldLeft, fields[index].first, fieldRight, fields[index].second, 10.0F);
        Gdiplus::SolidBrush fill(Gdiplus::Color(238, 8, 39, 34));
        const bool focused = (index == 0 && GetFocus() == state.server) ||
            (index == 1 && GetFocus() == state.username) ||
            (index == 2 && GetFocus() == state.password);
        Gdiplus::Pen border(focused ? Gdiplus::Color(255, 52, 212, 132)
                                    : Gdiplus::Color(205, 190, 158, 80),
            focused ? 1.5F : 1.0F);
        graphics.FillPath(&fill, path.get());
        graphics.DrawPath(&border, path.get());
    }

}

void DrawWindowFrame(Gdiplus::Graphics& graphics, WindowState& state, int width, int height)
{
    if (state.frame == nullptr) return;
    const int sw = static_cast<int>(state.frame->GetWidth());
    const int sh = static_cast<int>(state.frame->GetHeight());
    constexpr int sourceX = 82;
    constexpr int sourceY = 64;
    constexpr int edge = 18;
    const int middleSourceWidth = sw - sourceX * 2;
    const int middleSourceHeight = sh - sourceY * 2;
    auto draw = [&](int dx, int dy, int dw, int dh, int sx, int sy, int sourceWidth, int sourceHeight)
    {
        graphics.DrawImage(state.frame.get(), Gdiplus::Rect(dx, dy, dw, dh),
            sx, sy, sourceWidth, sourceHeight, Gdiplus::UnitPixel);
    };
    draw(0, 0, edge, edge, 0, 0, sourceX, sourceY);
    draw(edge, 0, width-edge*2, edge, sourceX, 0, middleSourceWidth, sourceY);
    draw(width-edge, 0, edge, edge, sw-sourceX, 0, sourceX, sourceY);
    draw(0, edge, edge, height-edge*2, 0, sourceY, sourceX, middleSourceHeight);
    draw(width-edge, edge, edge, height-edge*2, sw-sourceX, sourceY, sourceX, middleSourceHeight);
    draw(0, height-edge, edge, edge, 0, sh-sourceY, sourceX, sourceY);
    draw(edge, height-edge, width-edge*2, edge, sourceX, sh-sourceY, middleSourceWidth, sourceY);
    draw(width-edge, height-edge, edge, edge, sw-sourceX, sh-sourceY, sourceX, sourceY);
}

void PaintWindow(HWND window, WindowState& state, HDC target)
{
    RECT client{};
    GetClientRect(window, &client);
    const int width = client.right;
    const int height = client.bottom;
    const auto memory = CreateCompatibleDC(target);
    const auto bitmap = CreateCompatibleBitmap(target, width, height);
    const auto oldBitmap = SelectObject(memory, bitmap);

    {
        Gdiplus::Graphics graphics(memory);
        graphics.SetSmoothingMode(Gdiplus::SmoothingModeAntiAlias);
        DrawBackground(graphics, state, width, height);
        DrawPanel(graphics, state, width, height);
        DrawWindowFrame(graphics, state, width, height);

        if (state.mark != nullptr)
        {
            graphics.DrawImage(state.mark.get(), Gdiplus::Rect(26, 14, 42, 42));
        }
        Gdiplus::Pen titleRule(Gdiplus::Color(180, 52, 212, 132), 1.0F);
        graphics.DrawLine(&titleRule, 0, 67, width, 67);

        constexpr int progressLeft = 44;
        const int progressRight = width - 44;
        const int progressTop = height - 28;
        Gdiplus::SolidBrush track(Gdiplus::Color(255, 45, 55, 61));
        graphics.FillRectangle(&track, progressLeft, progressTop, progressRight - progressLeft, 3);
        const auto progressWidth = (progressRight - progressLeft) * state.progress / 100;
        Gdiplus::SolidBrush progressBrush(state.failed ? Gdiplus::Color(255, 197, 90, 98)
                                                       : Gdiplus::Color(255, 52, 212, 132));
        graphics.FillRectangle(&progressBrush, progressLeft, progressTop, progressWidth, 3);
    }

    constexpr int panelWidth = 400;
    const int panelLeft = width - panelWidth - 32;
    RECT brand{80, 18, 310, 51};
    DrawTextLine(memory, state.brandFont, L"MIRAJ OF ICARUS", brand, Moonsteel, DT_LEFT | DT_SINGLELINE | DT_VCENTER);
    RECT release{218, 21, 420, 48};
    DrawTextLine(memory, state.utilityFont, L"ALPHA  /  ACESSO", release, Jade, DT_LEFT | DT_SINGLELINE | DT_VCENTER);

    RECT eyebrow{44, height - 246, panelLeft - 50, height - 218};
    DrawTextLine(memory, state.utilityFont, L"O REINO ALÉM DO PORTÃO", eyebrow, Jade, DT_LEFT | DT_SINGLELINE);
    RECT title{44, height - 207, panelLeft - 52, height - 144};
    DrawTextLine(memory, state.displayFont, L"A passagem está aberta.", title, Moonsteel, DT_LEFT | DT_SINGLELINE);
    RECT subtitle{46, height - 137, panelLeft - 68, height - 84};
    DrawTextLine(memory, state.bodyFont,
        L"Entre e siga diretamente para seus personagens.", subtitle, Moonsteel, DT_LEFT | DT_WORDBREAK);

    RECT panelEyebrow{panelLeft + 38, 135, width - 70, 157};
    DrawTextLine(memory, state.utilityFont, L"PORTÃO DE ACESSO", panelEyebrow, AncientGold, DT_LEFT | DT_SINGLELINE);
    RECT panelTitle{panelLeft + 38, 162, width - 70, 194};
    DrawTextLine(memory, state.brandFont, L"Escolha seu reino", panelTitle, Moonsteel, DT_LEFT | DT_SINGLELINE);

    RECT serverLabel{panelLeft + 38, 201, width - 70, 220};
    RECT accountLabel{panelLeft + 38, 284, width - 70, 303};
    RECT passwordLabel{panelLeft + 38, 367, width - 70, 386};
    DrawTextLine(memory, state.labelFont, L"SERVIDOR", serverLabel, Mist, DT_LEFT | DT_SINGLELINE);
    DrawTextLine(memory, state.labelFont, L"CONTA", accountLabel, Mist, DT_LEFT | DT_SINGLELINE);
    DrawTextLine(memory, state.labelFont, L"SENHA", passwordLabel, Mist, DT_LEFT | DT_SINGLELINE);

    const auto statusColor = state.failed ? Failure : Jade;
    RECT status{panelLeft + 38, 458, width - 70, 478};
    DrawTextLine(memory, state.utilityFont, state.status.c_str(), status, statusColor, DT_LEFT | DT_SINGLELINE | DT_END_ELLIPSIS);
    RECT detail{panelLeft + 38, 486, width - 70, 520};
    DrawTextLine(memory, state.labelFont, state.detail.c_str(), detail, state.failed ? Failure : Mist,
        DT_LEFT | DT_SINGLELINE | DT_END_ELLIPSIS);

    RECT updateLabel{44, height - 49, 240, height - 31};
    DrawTextLine(memory, state.utilityFont, L"ATUALIZAÇÃO / INTEGRIDADE", updateLabel, Mist, DT_LEFT | DT_SINGLELINE);
    const auto progressText = std::to_wstring(state.progress) + L"%";
    RECT progressLabel{width - 110, height - 49, width - 44, height - 31};
    DrawTextLine(memory, state.utilityFont, progressText.c_str(), progressLabel, state.failed ? Failure : Jade,
        DT_RIGHT | DT_SINGLELINE);

    BitBlt(target, 0, 0, width, height, memory, 0, 0, SRCCOPY);
    SelectObject(memory, oldBitmap);
    DeleteObject(bitmap);
    DeleteDC(memory);
}

void DrawButton(const DRAWITEMSTRUCT& item, WindowState& state)
{
    const bool disabled = (item.itemState & ODS_DISABLED) != 0;
    const bool pressed = (item.itemState & ODS_SELECTED) != 0;
    const auto width = item.rcItem.right - item.rcItem.left;
    const auto height = item.rcItem.bottom - item.rcItem.top;

    if (item.CtlID == PlayId)
    {
        Gdiplus::Graphics graphics(item.hDC);
        graphics.SetSmoothingMode(Gdiplus::SmoothingModeAntiAlias);
        graphics.SetInterpolationMode(Gdiplus::InterpolationModeHighQualityBicubic);
        Gdiplus::SolidBrush medallion(disabled ? Gdiplus::Color(246, 5, 25, 22)
                                              : Gdiplus::Color(250, 4, 39, 32));
        Gdiplus::Pen ring(disabled ? Gdiplus::Color(155, 111, 116, 104)
                                  : Gdiplus::Color(235, 52, 212, 132), pressed ? 2.0F : 3.0F);
        graphics.FillEllipse(&medallion, 2, 2, width - 4, height - 4);
        graphics.DrawEllipse(&ring, 4, 4, width - 8, height - 8);
        if (state.mark != nullptr)
        {
            const float glow = state.launching ? 0.55F + static_cast<float>(state.pulse) / 450.0F
                : disabled ? 0.34F : pressed ? 0.72F
                : 0.82F + static_cast<float>(state.pulse) / 1000.0F;
            Gdiplus::ColorMatrix matrix{{
                {1,0,0,0,0},{0,1,0,0,0},{0,0,1,0,0},{0,0,0,glow,0},{0,0,0,0,1}}};
            Gdiplus::ImageAttributes attributes;
            attributes.SetColorMatrix(&matrix);
            const int inset = pressed ? 14 : 9;
            graphics.DrawImage(state.mark.get(), Gdiplus::Rect(inset, inset, width-inset*2, height-inset*2),
                0, 0, state.mark->GetWidth(), state.mark->GetHeight(), Gdiplus::UnitPixel, &attributes);
            if (state.launching)
            {
                Gdiplus::Pen passage(Gdiplus::Color(225, 52, 212, 132), 3.0F);
                graphics.DrawArc(&passage, 5, 9, width - 10, height - 18,
                    static_cast<float>(state.pulse * 4), 112.0F);
            }
        }
        return;
    }

    const bool close = item.CtlID == CloseId;
    if (state.windowControls != nullptr)
    {
        Gdiplus::Graphics graphics(item.hDC);
        Gdiplus::SolidBrush surface(Gdiplus::Color(255, 4, 28, 24));
        graphics.FillRectangle(&surface, 0, 0, width, height);
        graphics.SetInterpolationMode(Gdiplus::InterpolationModeHighQualityBicubic);
        const int column = pressed ? 2 : ((item.itemState & ODS_FOCUS) != 0 ? 1 : 0);
        const int row = close ? 1 : 0;
        const int cellWidth = static_cast<int>(state.windowControls->GetWidth()) / 3;
        const int cellHeight = static_cast<int>(state.windowControls->GetHeight()) / 2;
        graphics.DrawImage(state.windowControls.get(), Gdiplus::Rect(0, 0, width, height),
            column * cellWidth, row * cellHeight, cellWidth, cellHeight, Gdiplus::UnitPixel);
        return;
    }
    RECT text{0, 0, width, height};
    DrawTextLine(item.hDC, state.bodyFont, close ? L"×" : L"—", text,
        close ? Moonsteel : Mist, DT_CENTER | DT_SINGLELINE | DT_VCENTER);
}

void DrawServerItem(const DRAWITEMSTRUCT& item, WindowState& state)
{
    if (item.itemID == static_cast<UINT>(-1)) return;
    const bool selected = (item.itemState & ODS_SELECTED) != 0;
    const auto brush = CreateSolidBrush(selected ? RGB(15, 75, 58) : Iron);
    FillRect(item.hDC, &item.rcItem, brush);
    DeleteObject(brush);
    wchar_t text[256]{};
    SendMessageW(state.server, CB_GETLBTEXT, item.itemID, reinterpret_cast<LPARAM>(text));
    auto area = item.rcItem;
    area.left += 15;
    area.right -= 36;
    DrawTextLine(item.hDC, state.controlFont, text, area, selected ? Moonsteel : Mist,
        DT_LEFT | DT_SINGLELINE | DT_VCENTER | DT_END_ELLIPSIS);
    RECT arrow{item.rcItem.right - 34, item.rcItem.top, item.rcItem.right - 12, item.rcItem.bottom};
    DrawTextLine(item.hDC, state.controlFont, L"⌄", arrow, selected ? Jade : Mist,
        DT_CENTER | DT_SINGLELINE | DT_VCENTER);
}

LRESULT CALLBACK WindowProcedure(HWND window, UINT message, WPARAM wParam, LPARAM lParam)
{
    auto* state = reinterpret_cast<WindowState*>(GetWindowLongPtrW(window, GWLP_USERDATA));
    switch (message)
    {
    case WM_CREATE:
    {
        auto* created = new WindowState{};
        SetWindowLongPtrW(window, GWLP_USERDATA, reinterpret_cast<LONG_PTR>(created));
        const auto fontBytes = LoadResourceBytes(IDR_MIRAJ_DISPLAY_FONT);
        DWORD loadedFonts = 0;
        if (fontBytes.data != nullptr && fontBytes.size != 0)
            created->privateFont = AddFontMemResourceEx(
                const_cast<void*>(fontBytes.data), fontBytes.size, nullptr, &loadedFonts);
        created->displayFont = CreateFontW(34, 0, 0, 0, FW_NORMAL, FALSE, FALSE, FALSE,
            DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS, CLEARTYPE_QUALITY,
            DEFAULT_PITCH, L"Miraj Display");
        created->brandFont = CreateFontW(21, 0, 0, 0, FW_SEMIBOLD, FALSE, FALSE, FALSE,
            DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS, CLEARTYPE_QUALITY,
            DEFAULT_PITCH, L"Miraj Display");
        created->bodyFont = CreateFontW(17, 0, 0, 0, FW_NORMAL, FALSE, FALSE, FALSE,
            DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS, CLEARTYPE_QUALITY,
            DEFAULT_PITCH, L"Miraj Display");
        created->controlFont = CreateFontW(18, 0, 0, 0, FW_NORMAL, FALSE, FALSE, FALSE,
            DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS, CLEARTYPE_QUALITY,
            DEFAULT_PITCH, L"Miraj Display");
        created->labelFont = CreateFontW(13, 0, 0, 0, FW_SEMIBOLD, FALSE, FALSE, FALSE,
            DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS, CLEARTYPE_QUALITY,
            DEFAULT_PITCH, L"Miraj Display");
        created->utilityFont = CreateFontW(12, 0, 0, 0, FW_MEDIUM, FALSE, FALSE, FALSE,
            DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS, CLEARTYPE_QUALITY,
            DEFAULT_PITCH, L"Miraj Display");
        created->editBrush = CreateSolidBrush(Iron);
        LoadEmbeddedImage(created->background, *created, IDR_LAUNCHER_BACKGROUND);
        LoadEmbeddedImage(created->mark, *created, IDR_LAUNCHER_MARK);
        LoadEmbeddedImage(created->frame, *created, IDR_LAUNCHER_FRAME);
        LoadEmbeddedImage(created->buttonDefault, *created, IDR_BUTTON_DEFAULT);
        LoadEmbeddedImage(created->buttonFocused, *created, IDR_BUTTON_FOCUSED);
        LoadEmbeddedImage(created->buttonPressed, *created, IDR_BUTTON_PRESSED);
        LoadEmbeddedImage(created->buttonDisabled, *created, IDR_BUTTON_DISABLED);
        LoadEmbeddedImage(created->windowControls, *created, IDR_WINDOW_CONTROLS);

        created->username = CreateWindowExW(0, L"EDIT", L"", WS_CHILD | WS_VISIBLE | WS_TABSTOP | ES_AUTOHSCROLL,
            0, 0, 0, 0, window, reinterpret_cast<HMENU>(UsernameId), nullptr, nullptr);
        created->password = CreateWindowExW(0, L"EDIT", L"", WS_CHILD | WS_VISIBLE | WS_TABSTOP | ES_AUTOHSCROLL | ES_PASSWORD,
            0, 0, 0, 0, window, reinterpret_cast<HMENU>(PasswordId), nullptr, nullptr);
        created->server = CreateWindowExW(0, WC_COMBOBOXW, L"",
            WS_CHILD | WS_VISIBLE | WS_TABSTOP | CBS_DROPDOWNLIST | CBS_OWNERDRAWFIXED | CBS_HASSTRINGS,
            0, 0, 0, 0, window, reinterpret_cast<HMENU>(ServerId), nullptr, nullptr);
        created->play = CreateWindowExW(WS_EX_TRANSPARENT, L"BUTTON", L"JOGAR",
            WS_CHILD | WS_VISIBLE | WS_TABSTOP | BS_OWNERDRAW,
            0, 0, 0, 0, window, reinterpret_cast<HMENU>(PlayId), nullptr, nullptr);
        created->minimize = CreateWindowExW(0, L"BUTTON", L"",
            WS_CHILD | WS_VISIBLE | BS_OWNERDRAW,
            0, 0, 0, 0, window, reinterpret_cast<HMENU>(MinimizeId), nullptr, nullptr);
        created->close = CreateWindowExW(0, L"BUTTON", L"",
            WS_CHILD | WS_VISIBLE | BS_OWNERDRAW,
            0, 0, 0, 0, window, reinterpret_cast<HMENU>(CloseId), nullptr, nullptr);
        for (const auto control : {created->username, created->password, created->server})
        {
            SendMessageW(control, WM_SETFONT, reinterpret_cast<WPARAM>(created->controlFont), TRUE);
        }
        SendMessageW(created->username, EM_SETMARGINS, EC_LEFTMARGIN | EC_RIGHTMARGIN, MAKELPARAM(14, 14));
        SendMessageW(created->password, EM_SETMARGINS, EC_LEFTMARGIN | EC_RIGHTMARGIN, MAKELPARAM(14, 14));
        SendMessageW(created->username, EM_SETCUEBANNER, TRUE, reinterpret_cast<LPARAM>(L"Nome da conta"));
        SendMessageW(created->password, EM_SETCUEBANNER, TRUE, reinterpret_cast<LPARAM>(L"Sua senha"));
        SetWindowSubclass(created->username, InputSubclass, 1, 0);
        SetWindowSubclass(created->password, InputSubclass, 2, 0);
        SetWindowSubclass(created->server, ComboSubclass, 3, 0);
        EnableWindow(created->play, FALSE);
        SetTimer(window, 1, 45, nullptr);
        PostMessageW(window, LoadEnvironmentMessage, 0, 0);
        return 0;
    }
    case LoadEnvironmentMessage:
        if (state != nullptr)
        {
            try
            {
                state->apiEndpoint = LoadApiEndpoint();
                Refresh(window, *state, L"PROCURANDO REINOS",
                    L"Consultando os servidores disponíveis", 24);
                state->servers = miraj_of_icarus::launcher::BackendClient(state->apiEndpoint).GetServers();
                std::erase_if(state->servers, [](const auto& server) { return !server.available; });
                for (const auto& server : state->servers)
                {
                    const auto label = miraj_of_icarus::client::windows::ToWide(server.name + "  ·  " + server.region);
                    SendMessageW(state->server, CB_ADDSTRING, 0, reinterpret_cast<LPARAM>(label.c_str()));
                }
                if (!state->servers.empty())
                {
                    SendMessageW(state->server, CB_SETCURSEL, 0, 0);
                    state->environmentReady = true;
                    state->busy = false;
                    Refresh(window, *state, L"INFORME SUAS CREDENCIAIS",
                        L"O cliente será validado após a autenticação", 32);
                }
                else
                {
                    state->busy = false;
                    Refresh(window, *state, L"NENHUM REINO DISPONÍVEL",
                        L"Tente novamente mais tarde", 0, true);
                }
            }
            catch (const std::exception& exception)
            {
                state->busy = false;
                state->environmentReady = false;
                Refresh(window, *state, L"SERVIÇO INDISPONÍVEL",
                    miraj_of_icarus::client::windows::ToWide(exception.what()), 0, true);
            }
            UpdatePlayState(*state);
        }
        return 0;
    case WM_SIZE:
        if (state != nullptr) Layout(*state, LOWORD(lParam), HIWORD(lParam));
        return 0;
    case WM_TIMER:
        if (state != nullptr && wParam == 1)
        {
            state->pulse = (state->pulse + 14) % 180;
            if (state->pulse > 90) state->pulse = 180 - state->pulse;
            InvalidateRect(state->play, nullptr, FALSE);
        }
        return 0;
    case WM_NCHITTEST:
    {
        POINT point{GET_X_LPARAM(lParam), GET_Y_LPARAM(lParam)};
        ScreenToClient(window, &point);
        RECT client{};
        GetClientRect(window, &client);
        if (point.y >= 0 && point.y < 68 && point.x < client.right - 118) return HTCAPTION;
        return HTCLIENT;
    }
    case WM_ERASEBKGND:
        return 1;
    case WM_CTLCOLORSTATIC:
    case WM_CTLCOLOREDIT:
    case WM_CTLCOLORLISTBOX:
        if (state != nullptr)
        {
            const auto dc = reinterpret_cast<HDC>(wParam);
            SetTextColor(dc, Moonsteel);
            SetBkColor(dc, Iron);
            return reinterpret_cast<LRESULT>(state->editBrush);
        }
        break;
    case WM_MEASUREITEM:
        if (reinterpret_cast<MEASUREITEMSTRUCT*>(lParam)->CtlID == ServerId)
        {
            reinterpret_cast<MEASUREITEMSTRUCT*>(lParam)->itemHeight = 42;
            return TRUE;
        }
        break;
    case WM_DRAWITEM:
        if (state != nullptr)
        {
            const auto& item = *reinterpret_cast<DRAWITEMSTRUCT*>(lParam);
            if (item.CtlID == ServerId) DrawServerItem(item, *state);
            else DrawButton(item, *state);
            return TRUE;
        }
        break;
    case WM_COMMAND:
        if (state == nullptr) break;
        if ((LOWORD(wParam) == UsernameId || LOWORD(wParam) == PasswordId) && HIWORD(wParam) == EN_CHANGE)
        {
            UpdatePlayState(*state);
            return 0;
        }
        if (LOWORD(wParam) == ServerId && HIWORD(wParam) == CBN_SELCHANGE)
        {
            InvalidateRect(state->server, nullptr, FALSE);
            UpdatePlayState(*state);
            return 0;
        }
        if (LOWORD(wParam) == ServerId && HIWORD(wParam) == CBN_DROPDOWN)
        {
            COMBOBOXINFO information{};
            information.cbSize = sizeof(information);
            if (GetComboBoxInfo(state->server, &information) && information.hwndList != nullptr)
            {
                RECT listArea{};
                GetClientRect(information.hwndList, &listArea);
                SetWindowRgn(information.hwndList,
                    CreateRoundRectRgn(0, 0, listArea.right + 1, listArea.bottom + 1, 18, 18), TRUE);
            }
            return 0;
        }
        if (LOWORD(wParam) == MinimizeId && HIWORD(wParam) == BN_CLICKED)
        {
            ShowWindow(window, SW_MINIMIZE);
            return 0;
        }
        if (LOWORD(wParam) == CloseId && HIWORD(wParam) == BN_CLICKED)
        {
            DestroyWindow(window);
            return 0;
        }
        if (LOWORD(wParam) == PlayId && HIWORD(wParam) == BN_CLICKED)
        {
            const auto selected = static_cast<int>(SendMessageW(state->server, CB_GETCURSEL, 0, 0));
            if (selected < 0 || static_cast<std::size_t>(selected) >= state->servers.size()) return 0;
            state->busy = true;
            state->launching = true;
            UpdatePlayState(*state);
            Refresh(window, *state, L"ABRINDO PASSAGEM", L"Autenticando sua conta", 100);
            try
            {
                const auto backend = miraj_of_icarus::launcher::BackendClient(state->apiEndpoint);
                auto session = backend.Login(
                    miraj_of_icarus::client::windows::ToUtf8(ReadControl(state->username)),
                    miraj_of_icarus::client::windows::ToUtf8(ReadControl(state->password)));
                SetWindowTextW(state->password, L"");
                bool firstAccessToken = true;
                static_cast<void>(miraj_of_icarus::launcher::EnsureClientReady(
                    state->apiEndpoint, miraj_of_icarus::launcher::GameInstallDirectory(),
                    [&]
                    {
                        if (firstAccessToken)
                        {
                            firstAccessToken = false;
                            return session.accessToken;
                        }
                        session = backend.Refresh(session);
                        return session.accessToken;
                    },
                    [&](const miraj_of_icarus::launcher::UpdateProgress& update)
                    {
                        const auto percent = update.total == 0 ? 0 : static_cast<int>(
                            std::min<std::uint64_t>(100, update.completed * 100 / update.total));
                        Refresh(window, *state, update.status, update.detail, percent);
                    }));
                session = backend.Refresh(session);
                const auto admission = backend.EnterGame(
                    session, state->servers[static_cast<std::size_t>(selected)]);
                miraj_of_icarus::launcher::LaunchGame(
                    miraj_of_icarus::launcher::GameInstallDirectory() + L"\\MirajOfIcarusClient.exe",
                    {.sessionId = admission.sessionId,
                     .lobbyEndpoint = admission.lobbyEndpoint,
                     .lobbyTicket = admission.lobbyTicket,
                     .locale = "pt-BR"});
                Refresh(window, *state, L"ENTRADA AUTORIZADA", L"Abrindo o mundo de Miraj of Icarus", 100);
                ShowWindow(window, SW_HIDE);
            }
            catch (const std::exception& exception)
            {
                state->busy = false;
                state->launching = false;
                Refresh(window, *state, L"ENTRADA RECUSADA",
                    miraj_of_icarus::client::windows::ToWide(exception.what()), 100, true);
                UpdatePlayState(*state);
            }
            return 0;
        }
        break;
    case WM_PAINT:
        if (state != nullptr)
        {
            PAINTSTRUCT paint{};
            const auto dc = BeginPaint(window, &paint);
            PaintWindow(window, *state, dc);
            EndPaint(window, &paint);
            return 0;
        }
        break;
    case WM_DESTROY:
        if (state != nullptr)
        {
            KillTimer(window, 1);
            RemoveWindowSubclass(state->username, InputSubclass, 1);
            RemoveWindowSubclass(state->password, InputSubclass, 2);
            RemoveWindowSubclass(state->server, ComboSubclass, 3);
            DeleteObject(state->displayFont);
            DeleteObject(state->brandFont);
            DeleteObject(state->bodyFont);
            DeleteObject(state->controlFont);
            DeleteObject(state->labelFont);
            DeleteObject(state->utilityFont);
            DeleteObject(state->editBrush);
            state->background.reset();
            state->mark.reset();
            state->frame.reset();
            state->buttonDefault.reset();
            state->buttonFocused.reset();
            state->buttonPressed.reset();
            state->buttonDisabled.reset();
            state->windowControls.reset();
            for (auto* stream : state->resourceStreams) stream->Release();
            if (state->privateFont != nullptr) RemoveFontMemResourceEx(state->privateFont);
            delete state;
            SetWindowLongPtrW(window, GWLP_USERDATA, 0);
        }
        PostQuitMessage(0);
        return 0;
    default:
        break;
    }
    return DefWindowProcW(window, message, wParam, lParam);
}
}

int APIENTRY wWinMain(HINSTANCE instance, HINSTANCE, LPWSTR, int showCommand)
{
    int argumentCount = 0;
    auto* arguments = CommandLineToArgvW(GetCommandLineW(), &argumentCount);
    for (int index = 1; arguments != nullptr && index < argumentCount; ++index)
    {
        const std::wstring_view command(arguments[index]);
        if (command == L"--verify-release" || command == L"--probe-backend" ||
            command == L"--update-client")
        {
            const auto result = RunDiagnostic(command);
            LocalFree(arguments);
            return result;
        }
    }
    if (arguments != nullptr) LocalFree(arguments);

    SetProcessDpiAwarenessContext(DPI_AWARENESS_CONTEXT_PER_MONITOR_AWARE_V2);
    INITCOMMONCONTROLSEX controls{sizeof(controls), ICC_STANDARD_CLASSES};
    InitCommonControlsEx(&controls);
    Gdiplus::GdiplusStartupInput gdiplusInput;
    ULONG_PTR gdiplusToken = 0;
    if (Gdiplus::GdiplusStartup(&gdiplusToken, &gdiplusInput, nullptr) != Gdiplus::Ok) return 1;

    WNDCLASSEXW windowClass{};
    windowClass.cbSize = sizeof(windowClass);
    windowClass.style = CS_HREDRAW | CS_VREDRAW | CS_DROPSHADOW;
    windowClass.lpfnWndProc = WindowProcedure;
    windowClass.hInstance = instance;
    windowClass.hIcon = LoadIconW(instance, MAKEINTRESOURCEW(IDI_MIRAJ_OF_ICARUS));
    windowClass.hIconSm = LoadIconW(instance, MAKEINTRESOURCEW(IDI_MIRAJ_OF_ICARUS));
    windowClass.hCursor = LoadCursorW(nullptr, IDC_ARROW);
    windowClass.lpszClassName = L"MirajOfIcarusLauncherWindow";
    RegisterClassExW(&windowClass);

    constexpr int windowWidth = 1180;
    constexpr int windowHeight = 720;
    const auto screenWidth = GetSystemMetrics(SM_CXSCREEN);
    const auto screenHeight = GetSystemMetrics(SM_CYSCREEN);
    const auto window = CreateWindowExW(WS_EX_APPWINDOW, windowClass.lpszClassName, L"Miraj of Icarus Launcher",
        WS_POPUP | WS_MINIMIZEBOX,
        std::max(0, (screenWidth - windowWidth) / 2), std::max(0, (screenHeight - windowHeight) / 2),
        windowWidth, windowHeight, nullptr, nullptr, instance, nullptr);
    if (window == nullptr)
    {
        Gdiplus::GdiplusShutdown(gdiplusToken);
        return 1;
    }

    ShowWindow(window, showCommand);
    UpdateWindow(window);
    MSG message{};
    while (GetMessageW(&message, nullptr, 0, 0) > 0)
    {
        TranslateMessage(&message);
        DispatchMessageW(&message);
    }
    Gdiplus::GdiplusShutdown(gdiplusToken);
    return static_cast<int>(message.wParam);
}
