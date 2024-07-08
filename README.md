# Overview
This small project is a utility that helps to generate documentation for a teaching purpose.
It auto-generates explanations of code by integrating [LM Studio](https://lmstudio.ai/)

# Requirements
1. [Deno](https://deno.com/) 
2. [LM Studio](https://lmstudio.ai/)

# Build
Run the build.sh script. Feel free to update it if necessary.
It's just compiling some deno code to binary then copying it at the appropriate place so as to be invoked in the terminal

# Usage
1. Go to the folder containing the files you would like to cover, the README.md file will be created at that location
2. Invoke it as the following

```bash
  name_or_your_compiled_version file_1_name file_2_name_if_any
```