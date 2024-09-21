# Document Summarizer App

The Document Summarizer App allows users to upload a document (PDF, Word, or Excel) and receive an accurate summary of its content in less than 100 words. The app provides a simple and intuitive interface for summarizing documents quickly and efficiently.

## User Journey

### 1. Sign In with ZAPT

1. **Open the App**: Navigate to the Document Summarizer App in your web browser.
2. **Access Sign-In Page**: You are presented with the sign-in page titled "Sign in with ZAPT".
3. **Learn More (Optional)**: Click on the "Learn more about ZAPT" link to visit the ZAPT website in a new tab.
4. **Sign In**: Choose an authentication method (Google, Facebook, or Apple) and sign in to your account.

### 2. Upload and Summarize a Document

1. **Access the Summarizer**: After signing in, you are taken to the "Document Summarizer" interface.
2. **Choose a File**:
   - Click on the "Choose File" button with a paperclip icon.
   - A file selector dialog opens.
   - Select a PDF, Word (.doc or .docx), or Excel (.xls or .xlsx) file from your device.
3. **File Selection Confirmation**:
   - The selected file's name is displayed on the screen.
   - The "Choose File" button is disabled to prevent multiple uploads.
4. **Document Processing**:
   - The app automatically begins processing the uploaded document.
   - A loading indicator with the message "Processing your document..." appears.
5. **View Summary**:
   - Once processing is complete, a summary of the document is displayed below.
   - The summary is concise, accurate, and less than 100 words.
6. **Error Handling**:
   - If an unsupported file type is uploaded, an error message is displayed.
   - If an error occurs during processing, an appropriate error message is shown.

### 3. Sign Out

1. **Sign Out**:
   - Click the "Sign Out" button located at the top-right corner of the app.
   - You are signed out and returned to the sign-in page.

## Notes

- **Supported File Types**: PDF, Word (.doc and .docx), and Excel (.xls and .xlsx).
- **File Size Limit**: Large documents are truncated to the first 5000 characters for efficient processing.
- **Responsive Design**: The app is responsive and user-friendly across various screen sizes.
- **Visual Feedback**: Loading states and progress indicators enhance the user experience.
- **Security**: Authentication is handled securely through Supabase and ZAPT's authentication system.