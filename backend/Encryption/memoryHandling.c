#include "help.c"

void clear(uint8_t** A, int width);

long bytesToTotalChunks(long bytes);

uint8_t* allocateList(int size);

uint8_t** initializeMatrix(int n, int m);

void clearChunks(uint8_t*** chunks, long num_chunks);


uint8_t* allocateList(int size){
    uint8_t* A = (uint8_t*)malloc(size * sizeof(uint8_t));
    return A;
}

uint8_t** initializeMatrix(int n, int m){
    uint8_t** state = (uint8_t**)malloc(n * sizeof(uint8_t*));
    
    for(int i = 0; i < n; i++){
        state[i] = (uint8_t*)malloc(m * sizeof(uint8_t));
    }

    return state;
}

uint8_t*** initializeChunks(int num_chunks){
    uint8_t*** chunks = (uint8_t***)malloc(num_chunks * sizeof(uint8_t**));
    for(int i = 0; i < num_chunks; i++){
        chunks[i] = (uint8_t**)malloc(4 * sizeof(uint8_t*));
        for(int j = 0; j < 4; j++){
            chunks[i][j] = (uint8_t*)malloc(4 * sizeof(uint8_t));
        }
    }
    return chunks;
}

void clear(uint8_t** A, int width){
    for(int i = 0; i < width; i++){
        free(A[i]);
    }
    free(A);
}

void clearChunks(uint8_t*** chunks, long num_chunks){
    for(int i = 0; i < num_chunks; i++){
        clear(chunks[i], 4);
    }
}

long bytesToTotalChunks(long bytes){
    int num_chunks = bytes / 16;
    if(bytes % 16 != 0){ num_chunks++; }
    return num_chunks;
}