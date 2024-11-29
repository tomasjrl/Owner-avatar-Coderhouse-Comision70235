import mongoose from 'mongoose';
import User from '../models/user.model.js';
import bcrypt from 'bcrypt';

const createAdminUser = async () => {
    try {
        await mongoose.connect("mongodb+srv://usermongo:8wGHTRdShb2nNJU5@coder-cluster.fptla.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Coder-Cluster");
        console.log("Connected to database");

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'adminCoder@coder.com' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            await mongoose.connection.close();
            return;
        }

        // Create admin user
        const hashedPassword = await bcrypt.hash('adminCod3r123', 10);
        const adminUser = new User({
            first_name: 'Admin',
            last_name: 'Coder',
            email: 'adminCoder@coder.com',
            password: hashedPassword,
            role: 'admin'
        });

        await adminUser.save();
        console.log('Admin user created successfully');
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error creating admin user:', error);
        await mongoose.connection.close();
    }
};

createAdminUser();
