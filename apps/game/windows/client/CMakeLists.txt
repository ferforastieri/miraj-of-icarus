add_executable(MirajOfIcarusClient WIN32
  LaunchContextPipe.cpp
  LobbyClient.cpp
  main.cpp
)

target_link_libraries(MirajOfIcarusClient
  PRIVATE
    WickedEngine
    miraj_of_icarus_client_contracts
    miraj_of_icarus_client_winhttp
)
target_compile_definitions(MirajOfIcarusClient PRIVATE UNICODE _UNICODE WIN32_LEAN_AND_MEAN NOMINMAX)
target_compile_options(MirajOfIcarusClient PRIVATE /W4 /WX /utf-8)
set_target_properties(MirajOfIcarusClient PROPERTIES OUTPUT_NAME "MirajOfIcarusClient")

add_custom_command(TARGET MirajOfIcarusClient POST_BUILD
  COMMAND ${CMAKE_COMMAND} -E copy_if_different
    "${MIRAJ_OF_ICARUS_WICKED_ROOT}/WickedEngine/dxcompiler.dll"
    "$<TARGET_FILE_DIR:MirajOfIcarusClient>/dxcompiler.dll"
  COMMAND ${CMAKE_COMMAND} -E copy_directory
    "${MIRAJ_OF_ICARUS_WICKED_ROOT}/WickedEngine/shaders"
    "$<TARGET_FILE_DIR:MirajOfIcarusClient>/shaders"
)
