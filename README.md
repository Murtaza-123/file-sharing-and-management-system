File & Folder Sharing System - API

Run the project using Docker
docker-compose up --build

If it doesn’t run, first clean and try again:
docker-compose down -v
docker-compose up --build


To run in detached mode:
docker-compose up -d --build

Run locally without Docker
npm run dev
sequelize-cli db:migrate
npx sequelize-cli db:seed:all

API Key Generation

Primary Key
Endpoint: POST http://localhost:5000/generate-primary-key
Used for full access (read/write) to the user’s folders and files.

Secondary Key
Endpoint: POST http://localhost:5000/generate-secondary-key
Used for read-only access (list folders/files, view file metadata/content).

Folder Operations (Primary Key Required)

 Method  Endpoint                      Description                                   
 POST    `/create-folder`              Create a new folder inside the user directory 
 PATCH   `/update-folder`              Rename an existing folder                     
 DELETE  `/delete-folder/:folderName`  Delete a folder and its contents   


 File Operations (Primary Key Required)
  Method Endpoint                                 Description                                                 
POST    `/upload-file/:folderName`               Upload a file (supports up to 10MB via multipart/form-data) 
 PATCH   `/update-file/:folderName/:oldFileName`  Replace an existing file with a new uploaded file           
DELETE  `/delete-file/:folderName/:fileName`     Delete a specific file


Read-Only Operations (Primary & Secondary Keys)

Method  Endpoint                                      Description                                     
 GET     `/folders`                                    List all folders for the user                   
 GET     `/files/:folderName`                          List all files in a folder                      
 GET     `/file/content/:folderName/:fileName`         View/download file content                      
 GET     `/secondary/file/info/:folderName/:fileName`  View file metadata (size, createdAt, updatedAt) 





