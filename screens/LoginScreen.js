import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Platform, StatusBar, Alert, TextInput, TouchableOpacity } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { setPersistence, browserLocalPersistence } from "firebase/auth";
import axios from 'axios';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');


    // Check if user is already logged in
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("User is signed in:", user);
                navigation.replace('Home');
            } else {
                console.log("No user is signed in");
            }
        });
    
        // Cleanup the listener on component unmount
        return () => unsubscribe();
    }, []);
    

    // Handle login
    const handleLogin = async () => {
        await signInWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                const user = userCredential.user;
                console.log(user);
                Alert.alert('Logged in Successfully');
                navigation.replace('Home');
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(error);
                Alert.alert(errorMessage);
            });
    };

    return (
        <SafeAreaView style={styles.AndroidSafeArea}>
            <View>
                <TextInput
                    value={email}
                    onChangeText={(e) => setEmail(e)}
                    style={styles.inputBar}
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    value={password}
                    onChangeText={(e) => setPassword(e)}
                    style={styles.inputBar}
                    placeholder="Password"
                    secureTextEntry
                />
            </View>
            <TouchableOpacity onPress={handleLogin} style={styles.btn}>
                <Text style={styles.txt}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={{ marginTop: 10 }}>
                    Not registered? Register Here
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    AndroidSafeArea: {
        flex: 1,
        backgroundColor: 'white',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputBar: {
        width: 300,
        height: 40,
        borderWidth: 0.7,
        borderRadius: 30,
        marginBottom: 20,
        padding: 10,
    },
    btn: {
        width: 200,
        height: 40,
        backgroundColor: '#121212',
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    txt: {
        color: 'white',
    },
});

export default LoginScreen;
