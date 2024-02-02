const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { BlobServiceClient } = require('@azure/storage-blob');

// Capture GitHub repository details from command line arguments
const [owner, repo] = process.argv.slice(2);
if (!owner || !repo) {
    console.error('Please provide GitHub username and repository name as command-line arguments.');
    process.exit(1);
}

const localDownloadPath = './output'; // Local path to store downloaded files
const githubToken = '{your-github-token}'; 
axios.defaults.headers.common['Authorization'] = `token ${githubToken}`;

// Azure Blob Storage details
const AZURE_STORAGE_CONNECTION_STRING = "{your-azure-storage-connection-string}";
const containerName = "{blob-container-name}";

// Function to fetch and download markdown files from GitHub
async function fetchAndDownloadMarkdownFiles(gitPath = '') {
    try {
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${gitPath}`;
        const response = await axios.get(url);
        const files = response.data;

        for (const file of files) {
            if (file.type === 'file' && file.name.endsWith('.md') || file.name.endsWith('.jpeg') || 
            file.name.endsWith('.jpg') || file.name.endsWith('.png') || 
            file.name.endsWith('.gif')) {
                const fileResponse = await axios.get(file.download_url);
                const filePath = path.join(localDownloadPath, gitPath, file.name);
                fs.mkdirSync(path.dirname(filePath), { recursive: true });
                fs.writeFileSync(filePath, fileResponse.data);
                console.log('Downloaded:', filePath);
            } else if (file.type === 'dir') {
                await fetchAndDownloadMarkdownFiles(file.path);
            }
        }
    } catch (error) {
        console.error('Error fetching data from GitHub:', error);
    }
}

// Function to upload files to Azure Blob Storage
async function uploadFilesToAzure() {
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists();

    const uploadMarkdownFile = async (folderPath) => {
        const files = fs.readdirSync(folderPath);

        for (const file of files) {
            const filePath = path.join(folderPath, file);
            if (fs.statSync(filePath).isDirectory()) {
                await uploadMarkdownFile(filePath);
            } else if (file.endsWith('.md')||
                        file.endsWith('.jpeg') ||
                        file.endsWith('.jpg') ||
                        file.endsWith('.png') ||
                        file.endsWith('.gif')) {
                const blockBlobClient = containerClient.getBlockBlobClient(file);
                await blockBlobClient.uploadFile(filePath);
                console.log(`Uploaded ${file} to Azure Blob Storage`);
            }
        }
    };

    await uploadMarkdownFile(localDownloadPath);
}

// Main function to execute the process
async function main() {
    console.log('Starting download of Markdown files from GitHub...');
    await fetchAndDownloadMarkdownFiles();
    console.log('Starting upload of Markdown files to Azure Blob Storage...');
    await uploadFilesToAzure();
    console.log('Process completed.');
}

main().catch(console.error);

// run in the terminal: node src/githubtoblob.js {github repo owner} {github repo name}
