add_library(miraj_of_icarus_client_winhttp STATIC
  WinHttpClient.cpp
)

target_include_directories(miraj_of_icarus_client_winhttp
  PUBLIC ../include
)
target_link_libraries(miraj_of_icarus_client_winhttp PUBLIC winhttp)
target_compile_features(miraj_of_icarus_client_winhttp PUBLIC cxx_std_20)
target_compile_definitions(miraj_of_icarus_client_winhttp PRIVATE UNICODE _UNICODE WIN32_LEAN_AND_MEAN NOMINMAX)
target_compile_options(miraj_of_icarus_client_winhttp PRIVATE /W4 /WX /utf-8)
