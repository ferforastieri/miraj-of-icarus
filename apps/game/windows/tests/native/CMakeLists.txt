add_executable(miraj_of_icarus_client_contract_tests
  LaunchContextTests.cpp
)
target_link_libraries(miraj_of_icarus_client_contract_tests PRIVATE miraj_of_icarus_client_contracts)

if(MSVC)
  target_compile_options(miraj_of_icarus_client_contract_tests PRIVATE /W4 /WX)
else()
  target_compile_options(miraj_of_icarus_client_contract_tests PRIVATE -Wall -Wextra -Wpedantic -Werror)
endif()

add_test(NAME miraj_of_icarus_client_contract_tests COMMAND miraj_of_icarus_client_contract_tests)
