#include "memoryHandling.c"

void stateToChunk(uint8_t** state, uint8_t* chunk);

void bytesToChunks(uint8_t* bytes, uint8_t** chunks, long num_chunks);

void chunkToState(uint8_t* chunk, uint8_t** state);

void rotWord(uint8_t* A);

uint8_t* chunksToBytes(uint8_t** chunks, long num_chunks);




uint8_t* chunksToBytes(uint8_t** chunks, long num_chunks){
    uint8_t* bytes = allocateList(num_chunks * 16);
    for(int i = 0; i < num_chunks; i++){
        for(int j = 0; j < 16; j++){
            bytes[16 * i + j] = chunks[i][j];
        }
    }
    return bytes;
}

void stateToChunk(uint8_t** state, uint8_t* chunk){
    for(int i = 0; i < 4; i++){
        for(int j = 0; j < 4; j++){
            chunk[4 * i + j] = state[i][j];
        }
    }
}

void bytesToChunks(uint8_t* bytes, uint8_t** chunks, long num_chunks){
    for(int i = 0; i < num_chunks; i++){
        for(int j = 0; j < 16; j++){
            chunks[i][j] = bytes[16 * i + j];
        }
    }
}

void chunkToState(uint8_t* chunk, uint8_t** state){
    for(int i = 0; i < 4; i++){
        for(int j = 0; j < 4; j++){
            state[i][j] = chunk[4 * i + j];
        }
    }
}

void rotWord(uint8_t* A){
    uint8_t first = A[0];

    for(int i = 0; i < 4 - 1; i++){
        A[i] = A[i + 1];
    }

    A[3] = first;
}