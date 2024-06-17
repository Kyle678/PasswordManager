CC = gcc
CFLAGS = -Wall -Wextra -g
SRC_DIR = .
OBJ_DIR = obj
BIN_DIR = bin
TARGET = encryption

# List of source files
SRCS = $(wildcard $(SRC_DIR)/*.c)

# Generate a list of object files
OBJS = $(patsubst $(SRC_DIR)/%.c, $(OBJ_DIR)/%.o, $(SRCS))

# Main target
all: $(BIN_DIR)/$(TARGET)

# Rule to link object files into the final executable
$(BIN_DIR)/$(TARGET): $(OBJS) | $(BIN_DIR)
	$(CC) $(CFLAGS) $^ -o $@

# Rule to compile each source file into an object file
$(OBJ_DIR)/%.o: $(SRC_DIR)/%.c | $(OBJ_DIR)
	$(CC) $(CFLAGS) -c $< -o $@

# Create the object and binary directories if they don't exist
$(OBJ_DIR):
	mkdir -p $(OBJ_DIR)

$(BIN_DIR):
	mkdir -p $(BIN_DIR)

# Clean rule to remove generated files
clean:
	rm -rf $(OBJ_DIR) $(BIN_DIR)

.PHONY: all clean
