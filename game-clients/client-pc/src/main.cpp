#include "WickedEngine.h"
#include "LaunchContextPipe.h"
#include "LobbyClient.h"

#include <windows.h>

#include <exception>
#include <optional>

namespace
{
wi::Application Application;
std::optional<masicarus::client::LaunchContext> StartupContext;
std::optional<masicarus::game::LobbyState> ActiveLobby;

LRESULT CALLBACK WindowProcedure(HWND window, UINT message, WPARAM wParam, LPARAM lParam)
{
    switch (message)
    {
    case WM_SIZE:
    case WM_DPICHANGED:
        if (Application.is_window_active)
        {
            Application.SetWindow(window);
        }
        return 0;
    case WM_CHAR:
        if (wParam == VK_BACK)
        {
            wi::gui::TextInputField::DeleteFromInput();
        }
        else if (wParam != VK_RETURN)
        {
            wi::gui::TextInputField::AddInput(static_cast<wchar_t>(wParam));
        }
        return 0;
    case WM_INPUT:
        wi::input::rawinput::ParseMessage(reinterpret_cast<void*>(lParam));
        return 0;
    case WM_KILLFOCUS:
        Application.is_window_active = false;
        return 0;
    case WM_SETFOCUS:
        Application.is_window_active = true;
        return 0;
    case WM_DESTROY:
        PostQuitMessage(0);
        return 0;
    default:
        return DefWindowProcW(window, message, wParam, lParam);
    }
}
}

int APIENTRY wWinMain(HINSTANCE instance, HINSTANCE, LPWSTR commandLine, int)
{
    SetProcessDpiAwarenessContext(DPI_AWARENESS_CONTEXT_PER_MONITOR_AWARE_V2);

    try
    {
        StartupContext = masicarus::game::ReadLaunchContext(commandLine);
        ActiveLobby = masicarus::game::LobbyClient(StartupContext->lobbyEndpoint)
                          .Enter(StartupContext->lobbyTicket);
        StartupContext->lobbyTicket.clear();
    }
    catch (const std::exception& exception)
    {
        MessageBoxA(nullptr, exception.what(), "MASICARUS", MB_OK | MB_ICONERROR);
        return 2;
    }

    WNDCLASSEXW windowClass{};
    windowClass.cbSize = sizeof(windowClass);
    windowClass.style = CS_HREDRAW | CS_VREDRAW;
    windowClass.lpfnWndProc = WindowProcedure;
    windowClass.hInstance = instance;
    windowClass.hCursor = LoadCursorW(nullptr, IDC_ARROW);
    windowClass.hbrBackground = reinterpret_cast<HBRUSH>(COLOR_WINDOW + 1);
    windowClass.lpszClassName = L"MasicarusClientWindow";
    RegisterClassExW(&windowClass);

    const auto window = CreateWindowW(windowClass.lpszClassName, L"MASICARUS",
        WS_OVERLAPPEDWINDOW, CW_USEDEFAULT, 0, 1280, 720,
        nullptr, nullptr, instance, nullptr);
    if (window == nullptr)
    {
        return 1;
    }

    ShowWindow(window, SW_SHOWDEFAULT);
    Application.SetWindow(window);
    wi::arguments::Parse(commandLine);
    Application.infoDisplay.active = false;

    MSG message{};
    while (message.message != WM_QUIT)
    {
        if (PeekMessageW(&message, nullptr, 0, 0, PM_REMOVE))
        {
            TranslateMessage(&message);
            DispatchMessageW(&message);
        }
        else
        {
            Application.Run();
        }
    }

    wi::jobsystem::ShutDown();
    return static_cast<int>(message.wParam);
}
