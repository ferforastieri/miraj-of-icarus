add_library(masicarus_client_contracts STATIC
  src/LaunchContext.cpp
  src/ReleaseManifest.cpp
)

target_include_directories(masicarus_client_contracts
  PUBLIC include
)
target_link_libraries(masicarus_client_contracts
  PUBLIC nlohmann_json::nlohmann_json
)
target_compile_features(masicarus_client_contracts PUBLIC cxx_std_20)

if(MSVC)
  target_compile_options(masicarus_client_contracts PRIVATE /W4 /WX)
else()
  target_compile_options(masicarus_client_contracts PRIVATE -Wall -Wextra -Wpedantic -Werror)
endif()
