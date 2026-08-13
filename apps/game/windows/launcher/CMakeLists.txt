add_executable(MirajOfIcarusLauncher WIN32
  resources/launcher.rc
  src/BackendClient.cpp
  src/GameProcess.cpp
  src/ReleaseIntegrity.cpp
  src/ReleaseUpdater.cpp
  src/main.cpp
)

target_include_directories(MirajOfIcarusLauncher PRIVATE resources)

target_link_libraries(MirajOfIcarusLauncher
  PRIVATE
    miraj_of_icarus_client_contracts
    miraj_of_icarus_client_winhttp
    comctl32
    bcrypt
    crypt32
    d2d1
    dwrite
    gdiplus
    ole32
    shell32
)
set(MIRAJ_OF_ICARUS_PUBLIC_API_URL "http://localhost:8080" CACHE STRING "Public API used by the launcher")
target_compile_definitions(MirajOfIcarusLauncher PRIVATE
  UNICODE _UNICODE WIN32_LEAN_AND_MEAN NOMINMAX
  MIRAJ_OF_ICARUS_PUBLIC_API_URL="${MIRAJ_OF_ICARUS_PUBLIC_API_URL}"
)
target_compile_options(MirajOfIcarusLauncher PRIVATE /W4 /WX /utf-8)
set_target_properties(MirajOfIcarusLauncher PROPERTIES OUTPUT_NAME "MirajOfIcarusLauncher")
