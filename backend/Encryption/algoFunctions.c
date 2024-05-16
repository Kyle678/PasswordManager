#include "fileHandling.c"

void cipher(uint8_t** state, int Nr, uint8_t** w);

void invCipher(uint8_t** state, int Nr, uint8_t** w);

void mixColumns(uint8_t** state);

void invMixColumns(uint8_t** state);

void shiftRows(uint8_t** state);

void invShiftRows(uint8_t** state);

void subBytes(uint8_t* byte);

void subWord(uint8_t* bytes);

void subState(uint8_t** state);

void invSubState(uint8_t** state);

void addRoundKey(uint8_t** state, uint8_t** round_key);

void generateRoundConstants(uint8_t* Rcon, int Nr);

void generateInverseSBox();

void generateKey(uint8_t* key, int Nc);

void keyExpansion(uint8_t* key, uint8_t** round_keys, int Nk, int Nr);

void exportNewKey(int key_length, char* filepath);

long removePadding(uint8_t* bytes, int bytes_in_file);

uint8_t* getNewKey(int key_length);




void cipher(uint8_t** state, int Nr, uint8_t** w){
    addRoundKey(state, &w[0]);
    for(int i = 1; i < Nr - 1; i++){
        subState(state);
        shiftRows(state);
        mixColumns(state);
        addRoundKey(state, &w[4 * i]);
    }
    subState(state);
    shiftRows(state);
    addRoundKey(state, &w[4 * Nr]);
}

void invCipher(uint8_t** state, int Nr, uint8_t** w){
    addRoundKey(state, &w[4 * Nr]);
    invShiftRows(state);
    invSubState(state);
    for(int i = Nr - 2; i > 0; i--){
        addRoundKey(state, &w[4 * i]);
        invMixColumns(state);
        invShiftRows(state);
        invSubState(state);
    }
    addRoundKey(state, &w[0]);
}

void mixColumns(uint8_t** state){
    uint8_t temp[4];

    for(int i = 0; i < 4; i++){
        for(int j = 0; j < 4; j++){
            temp[j] = state[j][i];
        }
        for(int j = 0; j < 4; j++){
            state[j][i] = xTimes(mixing_matrix[j][0], temp[0]) ^ xTimes(mixing_matrix[j][1], temp[1]) ^ xTimes(mixing_matrix[j][2], temp[2]) ^ xTimes(mixing_matrix[j][3], temp[3]);
        }
    }
}

void invMixColumns(uint8_t** state){
    uint8_t temp[4];

    for(int i = 0; i < 4; i++){
        for(int j = 0; j < 4; j++){
            temp[j] = state[j][i];
        }
        for(int j = 0; j < 4; j++){
            state[j][i] = xTimes(reverse_mixing_matrix[j][0], temp[0]) ^ xTimes(reverse_mixing_matrix[j][1], temp[1]) ^ xTimes(reverse_mixing_matrix[j][2], temp[2]) ^ xTimes(reverse_mixing_matrix[j][3], temp[3]);
        }
    }
}

void shiftRows(uint8_t** state){
    for(int i = 1; i < 4; i++){
        for(int j = 0; j < i; j++){
            rotWord(state[i]);
        }
    }
}

void invShiftRows(uint8_t** state){
    for(int i = 1; i  < 4; i++){
        for(int j = 0; j < 4 - i; j++){
            rotWord(state[i]);
        }
    }
}

void subBytes(uint8_t* byte){
    *byte = aes_sbox[*byte];
}

void subWord(uint8_t* bytes){
    for(int i = 0; i < 4; i++){
        bytes[i] = aes_sbox[bytes[i]];
    }
}

void subState(uint8_t** state){
    for(int i = 0; i < 4; i++){
        subWord(state[i]);
    }
}

void invSubState(uint8_t** state){
    for(int i = 0; i < 4; i++){
        for(int j = 0; j < 4; j++){
            state[i][j] = inverse_aes_box[state[i][j]];
        }
    }
}

void addRoundKey(uint8_t** state, uint8_t** round_key){
    for(int i = 0; i < 4; i++){
        for(int j  = 0; j < 4; j++){
            state[i][j] ^= round_key[i][j];
        }
    }
}

long removePadding(uint8_t* bytes, int bytes_in_file){
    long last = bytes_in_file - 1;
    uint8_t padding = bytes[last];

    int is_padded = 1;
    for(long i = last; i > last - padding; i--){
        if(bytes[i] != padding){
            is_padded = 0;
            break;
        }
    }
    padding *= is_padded;

    long real_size = bytes_in_file;

    if(is_padded){
        real_size -= padding;
    }

    return real_size;
}

void generateRoundConstants(uint8_t* Rcon, int Nr){
    uint8_t temp = 0x01;
    Rcon[0] = temp;
    for(int i = 0; i < Nr - 1; i++){
        Rcon[i + 1] = xTimes(temp, 2);
        temp = Rcon[i + 1];
    }
}

void generateInverseSBox(){
    inverse_aes_box = allocateList(SBOX_SIZE);
    int x, y, z;
    for(int i = 0; i < SBOX_SIZE; i++){
        z = aes_sbox[i];
        inverse_aes_box[z] = i;
    }
}

void generateKey(uint8_t* key, int Nc){
    time_t t;

    srand((unsigned) time(&t));

    for(int i = 0; i < Nc; i++){
        key[i] = rand() % 256;
    }
}

void keyExpansion(uint8_t* key, uint8_t** round_keys, int Nk, int Nr){
    uint8_t* Rcon = allocateList(Nr);

    generateRoundConstants(Rcon, Nr);

    int i;

    for(i = 0; i <= Nk - 1; i++){
        for(int j = 0; j < 4; j++){
            round_keys[i][j] = key[4 * i + j];
        }
    }

    uint8_t temp[4];

    for(i; i < 4 * (Nr + 1); i++){
        for(int j = 0; j < 4; j++){
            temp[j] = round_keys[i - 1][j];
        }

        if(i % Nk == 0){ // g transform function
            rotWord(temp);
            subWord(temp);
            for(int j = 0; j < 4; j++){
                temp[j] ^= Rcon[(i / Nk) - 1];
            }
        }else if(Nk > 6 && i % Nk == 4){
            subWord(temp);
        }
        for(int j = 0; j < 4; j++){
            round_keys[i][j] = round_keys[i - Nk][j] ^ temp[j];
        }
    }

    free(Rcon);
}

uint8_t* getNewKey(int key_length){
    int Nc = key_length / 8;
    uint8_t* key = allocateList(Nc);
    generateKey(key, Nc);
    return key;
}

void exportNewKey(int key_length, char* filepath){
    uint8_t* key = getNewKey(key_length);
    exportKey(key, key_length, filepath);
    free(key);
}