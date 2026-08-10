add_library(masicarus_client_winhttp STATIC
  WinHttpClient.cpp
)

target_include_directories(masicarus_client_winhttp
  PUBLIC ../include
)
target_link_libraries(masicarus_client_winhttp PUBLIC winhttp)
target_compile_features(masicarus_client_winhttp PUBLIC cxx_std_20)
target_compile_definitions(masicarus_client_winhttp PRIVATE UNICODE _UNICODE WIN32_LEAN_AND_MEAN NOMINMAX)
target_compile_options(masicarus_client_winhttp PRIVATE /W4 /WX /utf-8)
