add_library(miraj_of_icarus_client_contracts STATIC
  src/LaunchContext.cpp
  src/ReleaseManifest.cpp
)

target_include_directories(miraj_of_icarus_client_contracts
  PUBLIC include
)
target_link_libraries(miraj_of_icarus_client_contracts
  PUBLIC nlohmann_json::nlohmann_json
)
target_compile_features(miraj_of_icarus_client_contracts PUBLIC cxx_std_20)

if(MSVC)
  target_compile_options(miraj_of_icarus_client_contracts PRIVATE /W4 /WX)
else()
  target_compile_options(miraj_of_icarus_client_contracts PRIVATE -Wall -Wextra -Wpedantic -Werror)
endif()
