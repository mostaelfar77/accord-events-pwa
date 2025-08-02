# Accord Events Registration System

A modern, user-friendly registration application for medical conferences organized by Accord Events. This system provides smooth attendee verification, registration, badge printing, and comprehensive reporting capabilities.

## 🚀 Features

### Core Functionality
- **Excel Upload**: Upload official attendee lists with Name and Phone Number columns
- **Smart Autocomplete**: Intelligent search with dropdown suggestions for partial matches
- **Duplicate Handling**: Clear identification of attendees with identical names using phone numbers
- **Walk-in Registration**: Register attendees not in the official list with manual phone entry
- **Real-time Tracking**: Save all registrations with timestamps and registration types
- **Badge Printing**: Immediate badge printing with accurate formatting
- **Certificate Generation**: Professional attendance certificates for later distribution
- **Comprehensive Reports**: Download detailed attendance reports in CSV format
- **System Reset**: Complete system reset functionality for new events

### Technical Features
- **Modern UI**: Clean, responsive design optimized for ushers
- **Offline Capable**: Works without internet connection
- **Data Persistence**: Local storage ensures data survives browser refreshes
- **Print Optimization**: Complete printing without blank pages
- **Error Handling**: Clear error messages for all operations
- **Performance**: Smooth registration flow with no lag

## 📋 Requirements

### System Requirements
- Node.js 14+ (for backend)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- 100MB free disk space

### Excel File Format
The system expects Excel files with exactly two columns:
1. **Name** (Column A)
2. **Phone Number** (Column B)

Example:
```
Name            | Phone Number
John Doe        | +1234567890
Jane Smith      | +0987654321
```

## 🛠️ Installation & Setup

### Option 1: Standalone Frontend (Recommended for Simple Use)

1. **Download the files**:
   ```bash
   cd /path/to/your/project
   ```

2. **Open the application**:
   - Navigate to the `frontend` folder
   - Open `index.html` in your web browser
   - The application will work immediately with local storage

### Option 2: Full Stack with Backend

1. **Install Node.js dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Start the server**:
   ```bash
   npm start
   # or for development
   npm run dev
   ```

3. **Access the application**:
   - Open your browser and go to `http://localhost:3001`
   - The application will be served with database persistence

## 📖 Usage Guide

### 1. Upload Attendees List

1. **Prepare your Excel file** with Name and Phone Number columns
2. **Click "Choose File"** or drag and drop the Excel file
3. **Verify upload success** - you'll see the number of attendees loaded
4. **Registration section appears** automatically after successful upload

### 2. Register Attendees

#### For Official Attendees:
1. **Type the attendee's name** in the search box
2. **Select from dropdown** if multiple matches appear
3. **Click "Register Attendee"** to complete registration
4. **Badge prints automatically** after successful registration

#### For Walk-in Attendees:
1. **Type the attendee's name** (not in official list)
2. **System prompts** for walk-in registration
3. **Enter phone number** manually
4. **Click "Register Walk-in"** to complete registration

#### Handling Duplicate Names:
- If multiple attendees have the same name, a modal appears
- **Select the correct person** by phone number
- **Click to register** the selected attendee

### 3. Generate Reports

1. **View real-time statistics** in the Reports section
2. **Download CSV report** with all registration data
3. **Print badges** for all registered attendees
4. **Print certificates** for all registered attendees

### 4. Reset System

1. **Click "Reset System"** in the header
2. **Confirm the action** in the modal
3. **System clears all data** and returns to initial state
4. **Ready for new event**

## 🎯 Key Features Explained

### Smart Autocomplete
- **Partial matching**: Type "Rawda" to find "Rawda Mohamed" and "Rawda Yasser"
- **Phone number display**: Shows both name and phone for clear identification
- **Keyboard navigation**: Use arrow keys and Enter to select
- **Escape to cancel**: Press Escape to close dropdown

### Walk-in Registration
- **Automatic detection**: System detects when name isn't in official list
- **Phone requirement**: Walk-ins must provide phone number
- **Status tracking**: Clearly marked as "Walk-in" in reports
- **Data integrity**: Walk-ins added to attendance sheet

### Badge Printing
- **Immediate printing**: Badges print automatically after registration
- **Professional design**: Clean, modern badge layout
- **Complete information**: Name, phone, registration type, event branding
- **Print optimization**: No blank pages or formatting issues

### Certificate Generation
- **Professional layout**: Formal certificate design
- **Complete information**: Name, registration type, date
- **Event branding**: Accord Events branding and logo
- **Signature space**: Space for coordinator signature

### Data Management
- **Local storage**: Data persists through browser refreshes
- **CSV export**: Download complete reports in Excel-compatible format
- **Real-time stats**: Live attendance statistics
- **Backup capability**: Export data before system reset

## 🔧 Technical Details

### Frontend Architecture
- **Vanilla JavaScript**: No framework dependencies
- **Modern CSS**: Flexbox and Grid layouts
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Local Storage**: Client-side data persistence
- **Print CSS**: Optimized printing styles

### Backend Architecture (Optional)
- **Node.js/Express**: RESTful API server
- **SQLite Database**: Lightweight, file-based database
- **File Upload**: Multer middleware for Excel processing
- **CORS Support**: Cross-origin resource sharing
- **Error Handling**: Comprehensive error management

### Data Structure
```javascript
// Attendee Object
{
  name: "John Doe",
  phone: "+1234567890",
  type: "official" // or "walk-in"
}

// Registration Object
{
  name: "John Doe",
  phone: "+1234567890",
  registrationType: "Official", // or "Walk-in"
  registrationTime: "2024-01-15T10:30:00.000Z"
}
```

## 🚨 Troubleshooting

### Common Issues

**Excel Upload Fails**
- Ensure file is .xlsx or .xls format
- Check that file has exactly 2 columns (Name, Phone)
- Verify no empty rows in the data

**Printing Issues**
- Ensure printer is connected and online
- Check browser print settings
- Try printing to PDF first

**Registration Not Working**
- Clear browser cache and reload
- Check if attendee is already registered
- Verify name spelling matches Excel file

**Data Disappears**
- Check browser storage settings
- Ensure cookies are enabled
- Try refreshing the page

### Performance Tips
- **Large attendee lists**: Upload Excel files with up to 10,000 attendees
- **Multiple ushers**: Multiple users can access simultaneously
- **Offline use**: Works without internet connection
- **Print queue**: Print badges one at a time for best results

## 📊 Report Formats

### CSV Report Columns
1. **Name**: Full attendee name
2. **Phone Number**: Contact phone number
3. **Registration Type**: "Official" or "Walk-in"
4. **Registration Time**: Date and time of registration

### Statistics Available
- **Total Registered**: All successful registrations
- **Official Attendees**: From uploaded Excel list
- **Walk-in Attendees**: Registered on-site
- **Real-time Updates**: Statistics update automatically

## 🔒 Security & Privacy

### Data Handling
- **Local storage**: Data stays on user's device
- **No cloud storage**: No external data transmission
- **Export capability**: Users control their data
- **Reset function**: Complete data deletion

### Best Practices
- **Regular backups**: Export reports before system reset
- **Secure devices**: Use on trusted computers only
- **Data validation**: System validates all inputs
- **Error logging**: Comprehensive error tracking

## 🆘 Support

### Getting Help
1. **Check this documentation** for common solutions
2. **Review error messages** for specific issues
3. **Export data** before troubleshooting
4. **Reset system** if needed for fresh start

### Feature Requests
- **Contact development team** for new features
- **Provide detailed requirements** for enhancements
- **Include use cases** for better understanding

## 📝 Changelog

### Version 1.0.0
- Initial release
- Excel upload functionality
- Smart autocomplete
- Walk-in registration
- Badge and certificate printing
- Comprehensive reporting
- System reset capability

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Accord Events Registration System** - Making medical conference registration smooth and efficient. 