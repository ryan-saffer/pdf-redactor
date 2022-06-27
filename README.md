# PDF Redactor
A simple tool to redact information from a batch of pdfs 📄

## How to install and run

### Git
Git is the tool you will need to download the software from this website.
To check that git is installed, open the terminal and run
```bash
git --version
```
If not installed, Xcode will prompt the user to install git through the command line tools. Press Install and agree to license.

> This download is ~2GB in size. It can always be uninstalled at the end by running:
> ```bash
> sudo rm -rf /Library/Developer/CommandLineTools
>```

### Get the code

Next let's clone this repo using git! When you run the below command, it will create a folder called `pdf-redactor` with the code inside it. Run the command somewhere such as a folder called `projects`.
```bash
git clone https://github.com/ryan-saffer/pdf-redactor.git
```
> If the authenticity of github.com is challenged, and asked 'Are you sure you want to continue connecting' type 'yes'

### Node
Node is a javascript runtime, and is needed to execute the code.
You can download node from its [website](https://nodejs.org/en/download/).
If you already have node installed, please ensure it is version 8 or above.
To verify node is installed, run the following command:
```bash
node --version
```

## Running the project

First, we need to move into the project directory.
```bash
cd pdf-redactor
```
Then we install all the dependencies:
```bash
npm install
```

### Adding the PDFTron License
Inside the folder `pdf-redactor`, create a file called `.env`:
```bash
touch .env
```
Ensure you can see hidden files on a mac by pressing `cmd + shift + .`
Open this file, and add the following line, and save the document:
```
PDF_TRON_KEY=REPLACE_WITH_LICENSE_KEY
```
>❗ License key purposely hidden. You can obtain a license key from [PDFTron](https://www.pdftron.com/)

Now we are ready to run the script. To run it, run:
```bash
npm start
```

# Folder structure
When you run the script, it will go through every file in the `data/pdfs` folder, and redact any term found in the `data/data.csv` file.
> Be sure **not** to remove the first line `term` in the `data.csv` file

## Tips for search terms
Every row in the `data.csv` file will be searched for and redacted individually. This means if you want to redact the following address:
75 Bourke St, Melbourne VIC 3000

It is better to put the following in the `data.csv` file:
```
75 Bourke St
75 Bourke Street
75 Bourke
Melbourne
VIC
3000
```

# Additional Information
If you have a large amount of Microsoft Word documents you need to first convert to PDF, you can use [this automator task](pdfConverter)
