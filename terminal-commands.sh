# Initialize a new Git repository (if not already done)
git init

# Add all your files
git add .

# Commit the files
git commit -m "Initial commit"

# Configure your Git username and email
git config --global user.name "Your Name"
git config --global user.email "sanoberbakhtawer@gmail.com"


# Verify your configuration
git config user.name "sanober007"
git config user.email "sanoberbakhtawer@gmail.com"
# Remove any existing remote connections (if any)
git remote remove origin

# Add your new repository as the remote with the correct URL
git remote add origin https://github.com/Sanober007/Operational-Tracker-.git

# Verify the remote was added correctly
git remote -v

git branch -m main
git push -u origin main



# Run the development server using the correct script name
npm run dev







