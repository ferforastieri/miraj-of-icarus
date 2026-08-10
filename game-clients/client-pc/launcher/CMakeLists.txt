add_executable(MasicarusLauncher WIN32
  resources/launcher.rc
  src/BackendClient.cpp
  src/GameProcess.cpp
  src/ReleaseIntegrity.cpp
  src/ReleaseUpdater.cpp
  src/main.cpp
)

target_include_directories(MasicarusLauncher PRIVATE resources)

target_link_libraries(MasicarusLauncher
  PRIVATE
    masicarus_client_contracts
    masicarus_client_winhttp
    comctl32
    bcrypt
    crypt32
    d2d1
    dwrite
    gdiplus
    shell32
)
target_compile_definitions(MasicarusLauncher PRIVATE UNICODE _UNICODE WIN32_LEAN_AND_MEAN NOMINMAX)
target_compile_options(MasicarusLauncher PRIVATE /W4 /WX /utf-8)
set_target_properties(MasicarusLauncher PROPERTIES OUTPUT_NAME "MasicarusLauncher")
