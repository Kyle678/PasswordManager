#include "algoFunctions.c"


void encryptFile(char* filepath, char* keypath, char* exportpath);

void decryptFile(char* filepath, char* keypath, char* exportpath);

int main(){

    generateInverseSBox();

    clock_t start, end;
    double cpu_time_used;

    int action;
    int key_option;

    char filepath[255], keypath[255], exportpath[255];

    int exit = 1;

    while(exit){

        printf("\n1) Generate Key\n\n2) Encrypt File\n\n3) Decrypt File\n\n4) Quit\n\n");
        printf("Enter choice: ");

        scanf("%d", &action);

        switch(action){
            case 1:
                printf("----------------\n\n");
                printf("1) 128\n\n2) 192\n\n3) 256\n\n");
                printf("Enter key size: ");
                scanf("%d", &key_option);
                printf("\nEnter file to export to: ");
                scanf("%s", &keypath);
                if(key_option > 0 && key_option < 4){
                    int key_lengths[] = {128, 192, 256};
                    exportNewKey(key_lengths[key_option - 1], keypath);
                    printf("\nKey successfully exported.\n");
                }else{
                    printf("\nInvalid choice.\n");
                }
                break;
            case 2:
                printf("\nEnter file path: ");
                scanf("%s", &filepath);
                printf("\nEnter key path: ");
                scanf("%s", &keypath);
                printf("\nEnter file to export to: ");
                scanf("%s", &exportpath);
                start = clock();
                encryptFile(filepath, keypath, exportpath);
                end = clock();
                cpu_time_used = ((double) (end - start)) / CLOCKS_PER_SEC;
                printf("\nFile encrypted in %f seconds.\n", cpu_time_used);
                break;
            case 3:
                printf("\nEnter file path: ");
                scanf("%s", &filepath);
                printf("\nEnter key path: ");
                scanf("%s", &keypath);
                printf("\nEnter file to export to: ");
                scanf("%s", &exportpath);
                start=clock();
                decryptFile(filepath, keypath, exportpath);
                end = clock();
                cpu_time_used = ((double) (end - start)) / CLOCKS_PER_SEC;
                printf("\nFile decrypted successfully in %f seconds.\n", cpu_time_used);
                break;
            case 4:
                exit = 0;
                break;
            default:
                printf("\nInvalid Choice.\n");
        }
    }

    return 0;
}

void encryptFile(char* filepath, char* keypath, char* exportpath){
    checkFiles(filepath, keypath);

    int bytes_in_key = getBytesInFile(keypath) / 2;
    uint8_t* key = readKeyFromFile(keypath, bytes_in_key);

    int key_size = bytes_in_key * 8; // number of bits that make up the key
    int Nk = key_size / 32; // number of 32 bit chunks in key
    int Nr = Nk + 6; // number of rounds respective to the key_size
    int Nc = key_size / 8; // quantity of 8 bit numbers in key

    uint8_t** round_keys = initializeMatrix(4 * (Nr + 1), 4);
    keyExpansion(key, round_keys, Nk, Nr);
    free(key);

    long bytes_in_file = getBytesInFile(filepath);
    long num_chunks = bytesToTotalChunks(bytes_in_file);
    long total_bytes = num_chunks * 16;

    uint8_t padding = 16 - (bytes_in_file % 16);
    if(padding == 16){ padding = 0; }

    uint8_t*** chunks = initializeChunks(num_chunks);

    fileToChunks(filepath, chunks);

    for(int i = 16 - padding; i < 16; i++){
        chunks[num_chunks-1][i / 4][i % 4] = padding;
    }

    for(int i = 0; i < num_chunks; i++){
        cipher(chunks[i], Nr, round_keys);
    }
    clear(round_keys, 4 * (Nr + 1));

    writeChunksToFile(chunks, total_bytes, exportpath);
    clearChunks(chunks, num_chunks);

    printf("\nSuccessfully encrypted file.\n");
}

void decryptFile(char* filepath, char* keypath, char* exportpath){

    checkFiles(filepath, keypath);

    long bytes_in_key = getBytesInFile(keypath) / 2;

    uint8_t* key = readKeyFromFile(keypath, bytes_in_key);

    long bytes_in_file = getBytesInFile(filepath);
    long num_chunks = bytesToTotalChunks(bytes_in_file);

    int key_size = bytes_in_key * 8; // number of bits that make up the key
    int Nk = key_size / 32; // number of 32 bit chunks in key
    int Nr = Nk + 6; // number of rounds respective to the key_size
    int Nc = key_size / 8; // quantity of 8 bit numbers in key

    uint8_t** round_keys = initializeMatrix(4 * (Nr + 1), 4);
    keyExpansion(key, round_keys, Nk, Nr);
    free(key);

    uint8_t*** chunks = initializeChunks(num_chunks);
    fileToChunks(filepath, chunks);

    for(int i = 0; i < num_chunks; i++){
        invCipher(chunks[i], Nr, round_keys);
    }
    clear(round_keys, 4 * (Nr + 1));

    uint8_t padding = chunks[num_chunks - 1][3][3];
    uint8_t is_padded = 1;

    for(int i = 16 - padding; i < 16; i++){
        if(chunks[num_chunks - 1][i / 4][i % 4] != padding){
            is_padded = 0;
            break;
        }
    }
    padding *= is_padded;

    writeChunksToFile(chunks, (num_chunks * 16) - padding, exportpath);
    clearChunks(chunks, num_chunks);
}