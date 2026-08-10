add_executable(masicarus_client_contract_tests
  LaunchContextTests.cpp
)
target_link_libraries(masicarus_client_contract_tests PRIVATE masicarus_client_contracts)

if(MSVC)
  target_compile_options(masicarus_client_contract_tests PRIVATE /W4 /WX)
else()
  target_compile_options(masicarus_client_contract_tests PRIVATE -Wall -Wextra -Wpedantic -Werror)
endif()

add_test(NAME masicarus_client_contract_tests COMMAND masicarus_client_contract_tests)
