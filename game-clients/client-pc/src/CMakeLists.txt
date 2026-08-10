add_executable(MasicarusClient WIN32
  LaunchContextPipe.cpp
  LobbyClient.cpp
  main.cpp
)

target_link_libraries(MasicarusClient
  PRIVATE
    WickedEngine
    masicarus_client_contracts
    masicarus_client_winhttp
)
target_compile_definitions(MasicarusClient PRIVATE UNICODE _UNICODE WIN32_LEAN_AND_MEAN NOMINMAX)
target_compile_options(MasicarusClient PRIVATE /W4 /WX /utf-8)
set_target_properties(MasicarusClient PROPERTIES OUTPUT_NAME "MasicarusClient")

add_custom_command(TARGET MasicarusClient POST_BUILD
  COMMAND ${CMAKE_COMMAND} -E copy_if_different
    "${MASICARUS_WICKED_ROOT}/WickedEngine/dxcompiler.dll"
    "$<TARGET_FILE_DIR:MasicarusClient>/dxcompiler.dll"
  COMMAND ${CMAKE_COMMAND} -E copy_directory
    "${MASICARUS_WICKED_ROOT}/WickedEngine/shaders"
    "$<TARGET_FILE_DIR:MasicarusClient>/shaders"
)
