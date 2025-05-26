const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/routes/PrivateRoute.jsx',
  'src/pages/Register.jsx',
  'src/pages/Pets.jsx',
  'src/pages/PetDetail.jsx',
  'src/pages/Login.jsx',
  'src/pages/EditProfile.jsx',
  'src/pages/EditPet.jsx',
  'src/pages/CommunityDetail.jsx',
  'src/pages/Communities.jsx',
  'src/pages/Blogs.jsx',
  'src/pages/BlogDetails.jsx',
  'src/pages/BlogDetail.jsx',
  'src/pages/Blog.jsx',
  'src/pages/AdoptionRequests.jsx',
  'src/pages/AddPet.jsx',
  'src/pages/AddBlog.jsx',
  'src/components/Chat.jsx',
  'src/components/MyBlogs.jsx',
  'src/components/MyPets.jsx',
  'src/components/Navbar.jsx',
  'src/components/PrivateRoute.jsx',
  'src/components/MyOrders.jsx',
  'src/components/MyAdoptions.jsx',
  'src/components/CommunityChat.jsx',
  'src/components/BusinessRoute.jsx',
  'src/components/AdminRoute.jsx'
];

filesToUpdate.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(
      /from ['"]\.\.\/context\/AuthContext['"]/g,
      'from \'../contexts/AuthContext\''
    );
    fs.writeFileSync(fullPath, content);
    console.log(`Updated ${filePath}`);
  } else {
    console.log(`File not found: ${filePath}`);
  }
}); 