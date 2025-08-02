# 🚀 Quick Start Guide

## Option 1: Standalone (No Installation Required)

1. **Open the application**:
   - Navigate to the `frontend` folder
   - Open `index.html` in your web browser
   - The application works immediately!

2. **Upload your Excel file**:
   - Click "Choose File" or drag and drop
   - Ensure your Excel has Name and Phone Number columns
   - See the upload success message

3. **Start registering attendees**:
   - Type names in the search box
   - Select from dropdown if multiple matches
   - Click "Register Attendee"
   - Badges print automatically!

## Option 2: Full System (With Database)

1. **Install Node.js** (if not already installed):
   - Download from https://nodejs.org/
   - Or use: `brew install node` (macOS)

2. **Run the startup script**:
   ```bash
   ./start.sh
   ```

3. **Access the application**:
   - Open http://localhost:3001 in your browser
   - Start using immediately!

## 📋 Sample Data

Use the included `sample_attendees.csv` file for testing:
1. Open the CSV file in Excel or Google Sheets
2. Save as .xlsx format
3. Upload to test the system

## 🎯 Key Features to Try

### Smart Search
- Type "Rawda" to see both "Rawda Mohamed" and "Rawda Yasser"
- Use arrow keys to navigate dropdown
- Press Enter to select

### Walk-in Registration
- Type a name not in your Excel file
- System will prompt for walk-in registration
- Enter phone number manually

### Reports
- View real-time statistics
- Download CSV reports
- Print badges and certificates

### System Reset
- Click "Reset System" in header
- Confirm to clear all data
- Ready for new event

## 🆘 Need Help?

- Check the main README.md for detailed documentation
- Ensure Excel file has exactly 2 columns: Name and Phone Number
- Try refreshing the browser if issues occur
- Export data before resetting system

---

**Ready to go!** The system is designed to be intuitive and user-friendly for ushers with minimal training. 