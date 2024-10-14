import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Platform, StatusBar, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore'; // Import onSnapshot for real-time updates
import { db } from '../firebaseConfig'; // Import your Firestore instance
import AddHabits from '../components/AddHabits';

const HomeScreen = () => {
    const [user, setUser] = useState(null);
    const [habits, setHabits] = useState([]); // State to hold habits

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Set user information
                setUser({ uid: user.uid, email: user.email, name: user.displayName });
                fetchHabits(user.uid); // Fetch habits when user is logged in
            } else {
                // User is signed out or not found
                Alert.alert("User not found");
                setUser(null);
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    // Function to fetch habits from Firestore in real-time
    const fetchHabits = (uid) => {
        const userDocRef = doc(db, "users", uid); // Reference to user's document
        const habitsCollectionRef = collection(userDocRef, "habits"); // Reference to habits subcollection

        // Subscribe to real-time updates
        const unsubscribe = onSnapshot(habitsCollectionRef, (snapshot) => {
            const habitsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // Map to extract habit data
            setHabits(habitsList); // Set habits state
        }, (error) => {
            console.error("Error fetching habits: ", error);
            Alert.alert("Error fetching habits: ", error.message);
        });

        // Return the unsubscribe function to stop listening for updates when the component unmounts
        return unsubscribe;
    };

    const requestPermissions = async () => {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
            const { status: finalStatus } = await Notifications.requestPermissionsAsync();
            if (finalStatus !== 'granted') {
                Alert.alert('Notification permissions not granted');
                return;
            }
        }
    };

    requestPermissions();

    const deleteHabit = async (habitId) => {
        const user = auth.currentUser;
        if (!user) {
            Alert.alert("User not logged in");
            return;
        }

        try {
            const userDocRef = doc(db, "users", user.uid); // Reference to user's document
            const habitDocRef = doc(userDocRef, "habits", habitId); // Reference to the specific habit document
            await deleteDoc(habitDocRef); // Delete the habit document from Firestore
            Alert.alert("Habit deleted successfully");
        } catch (error) {
            console.error("Error deleting habit: ", error);
            Alert.alert("Error deleting habit: ", error.message);
        }
    };

    // Function to format Firestore Timestamp to a readable string
    const formatTime = (timestamp) => {
        if (timestamp && timestamp.seconds) {
            const date = new Date(timestamp.seconds * 1000); // Convert to Date
            return date.toLocaleTimeString(); // Format time as per your locale
        }
        return ""; // Return an empty string if no timestamp
    };

    return (
        <SafeAreaView style={styles.AndroidSafeArea}>
            <View style={styles.header}>
                <Text style={{ fontSize: 20, color: "white" }}>
                    Welcome {user ? user.name : "No user available"} to your Habit Dashboard
                </Text>
            </View>
            <AddHabits />
            <ScrollView contentContainerStyle={{ width: 400 }}>
                {habits.length > 0 ? (
                    habits.map((habit) => (
                        <View key={habit.id} style={styles.habitItem}>
                            <Text style={styles.habitText}>{habit.habit}</Text>
                            <Text style={styles.habitText}>{formatTime(habit.time)}</Text> 
                            
                            <TouchableOpacity onPress={() => deleteHabit(habit.id)} style={{ width: 100, height: 40, backgroundColor: '#121212', borderRadius: 30, alignItems: "center", justifyContent: "center" }}>
                                <Text style={{ color: "white" }}>Delete Habit</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                ) : (
                    <Text style={styles.noHabitsText}>No habits found. Start adding some!</Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    AndroidSafeArea: {
        flex: 1,
        backgroundColor: "white",
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        alignItems: "center"
    },
    header: {
        width: '100%',
        alignItems: "center",
        justifyContent: "center",
        height: 50,
        flexDirection: "row",
        backgroundColor: "#121212"
    },
    habitItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        alignItems: 'center',
        flexDirection: "row",
        justifyContent: "space-around",
        height: 60
    },
    habitText: {
        fontSize: 16,
        color: "#333"
    },
    noHabitsText: {
        padding: 20,
        textAlign: 'center',
        fontSize: 16,
        color: "#999"
    }
});

export default HomeScreen;
