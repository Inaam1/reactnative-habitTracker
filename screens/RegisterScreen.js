import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Platform, StatusBar, TextInput, TouchableOpacity, Alert } from 'react-native';
import { auth, db } from "../firebaseConfig"; // Ensure firebaseConfig is properly configured
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore"; // Firestore imports

const RegisterScreen = ({ navigation }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Function to handle user registration
    const handleRegister = async () => {
        try {
            // Create user with email and password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update the user's display name
            await updateProfile(user, { displayName: name });

            // Set the user's data in Firestore using uid as document ID
            try {
                await setDoc(doc(db, "users", user.uid), {
                    name: user.displayName,
                    email: user.email,
                });
                console.log("Document written with ID: ", user.uid);
            } catch (e) {
                console.error("Error adding document: ", e);
            }

            // Show success alert and navigate to Home
            Alert.alert('User registered successfully');
            console.log('User registered:', user);
            navigation.replace('Home'); // Navigate to Home screen after registration
        } catch (error) {
            console.error('Error registering user:', error);
            Alert.alert(error.message);
        }
    }

    return (
        <SafeAreaView style={styles.AndroidSafeArea}>
            <View>
                <TextInput
                    value={name}
                    onChangeText={(e) => setName(e)}
                    style={styles.inputBar}
                    placeholder="Name"
                />
                <TextInput
                    value={email}
                    onChangeText={(e) => setEmail(e)}
                    style={styles.inputBar}
                    placeholder="Email"
                    keyboardType="email-address" // Optimized for email input
                />
                <TextInput
                    value={password}
                    onChangeText={(e) => setPassword(e)}
                    style={styles.inputBar}
                    placeholder="Password"
                    secureTextEntry={true} // Hide password input
                />
            </View>
            <TouchableOpacity onPress={handleRegister} style={styles.btn}>
                <Text style={styles.txt}>Register</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    AndroidSafeArea: {
        flex: 1,
        backgroundColor: "white",
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        alignItems: "center",
        justifyContent: "center"
    },
    inputBar: {
        width: 300,
        height: 40,
        borderWidth: 0.7,
        borderRadius: 30,
        marginBottom: 20,
        padding: 10
    },
    btn: {
        width: 200,
        height: 40,
        backgroundColor: '#121212',
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center"
    },
    txt: {
        color: "white"
    }
});

export default RegisterScreen;
