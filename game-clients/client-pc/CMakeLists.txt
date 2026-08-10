cmake_minimum_required(VERSION 3.25)

project(MasicarusClientPC VERSION 0.1.0 LANGUAGES C CXX)

include(CTest)
include(FetchContent)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

option(MASICARUS_BUILD_WINDOWS_APPS "Build the Windows launcher and game client" ${WIN32})
option(MASICARUS_BUILD_GAME_CLIENT "Build the 3D game client when Windows apps are enabled" ON)
option(MASICARUS_BUILD_TESTS "Build portable client contract tests" ON)
set(MASICARUS_WICKED_ROOT "" CACHE PATH "Path to a pinned Wicked Engine checkout")

FetchContent_Declare(
  nlohmann_json
  URL https://github.com/nlohmann/json/releases/download/v3.12.0/json.tar.xz
  URL_HASH SHA256=42f6e95cad6ec532fd372391373363b62a14af6d771056dbfc86160e6dfff7aa
  DOWNLOAD_EXTRACT_TIMESTAMP TRUE
)
set(JSON_BuildTests OFF CACHE INTERNAL "")
set(JSON_Install OFF CACHE INTERNAL "")
FetchContent_MakeAvailable(nlohmann_json)

add_subdirectory(common)

if(MASICARUS_BUILD_TESTS)
  add_subdirectory(tests/native)
endif()

if(MASICARUS_BUILD_WINDOWS_APPS)
  if(NOT WIN32)
    message(FATAL_ERROR "MASICARUS_BUILD_WINDOWS_APPS requires a Windows target toolchain")
  endif()

  enable_language(RC)
  add_subdirectory(common/windows)
  add_subdirectory(launcher)

  if(MASICARUS_BUILD_GAME_CLIENT)
    set(WICKED_DYNAMIC_LIBRARY OFF CACHE BOOL "" FORCE)
    set(WICKED_EDITOR OFF CACHE BOOL "" FORCE)
    set(WICKED_TESTS OFF CACHE BOOL "" FORCE)
    set(WICKED_IMGUI_EXAMPLE OFF CACHE BOOL "" FORCE)
    set(WICKED_LINUX_TEMPLATE OFF CACHE BOOL "" FORCE)
    set(WICKED_WINDOWS_TEMPLATE OFF CACHE BOOL "" FORCE)
    set(WICKED_ENABLE_IPO OFF CACHE BOOL "" FORCE)
    set(WICKED_ENABLE_RTTI OFF CACHE BOOL "" FORCE)
    set(WICKED_EMBED_SHADERS OFF CACHE BOOL "" FORCE)

    if(MASICARUS_WICKED_ROOT STREQUAL "")
      FetchContent_Declare(
        wicked_engine
        GIT_REPOSITORY https://github.com/turanszkij/WickedEngine.git
        GIT_TAG 27c0df160d738925474a2181d3f88bfd59edaefe
        GIT_SHALLOW TRUE
        GIT_PROGRESS TRUE
      )
      FetchContent_MakeAvailable(wicked_engine)
      set(MASICARUS_WICKED_ROOT "${wicked_engine_SOURCE_DIR}")
    else()
      add_subdirectory("${MASICARUS_WICKED_ROOT}" "${CMAKE_BINARY_DIR}/wicked-engine")
    endif()

    add_subdirectory(src)
  endif()
endif()
