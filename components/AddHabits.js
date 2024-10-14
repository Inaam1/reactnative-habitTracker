import React, { useState } from 'react';
import { Image, StyleSheet, TextInput, TouchableOpacity, View, Alert, Text } from 'react-native';
import add from "../assets/add.png";
import { db, auth } from "../firebaseConfig"; // Import Firebase Firestore and Auth
import { collection, doc, addDoc } from 'firebase/firestore'; // Firestore methods
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';

const AddHabits = () => {
    const [habit, setHabit] = useState(""); // State to store the habit input
    const [time, setTime] = useState(new Date()); // State to store the time input
    const [showPicker, setShowPicker] = useState(false); // State to control the DateTimePicker visibility

    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
        }),
    });

    const scheduleNotification = async (habit, date) => {
        const trigger = new Date(date); // Use the provided date directly
        trigger.setSeconds(0); // Reset seconds for precision
        
        if (trigger < new Date()) {
            // If the time has already passed today, schedule it for tomorrow
            trigger.setDate(trigger.getDate() + 1);
        }

        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Habit Reminder!',
                body: `Time to work on: ${habit}`,
                sound: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger,
        });
    };

    const handleHabitAdd = async () => {
        const user = auth.currentUser;
        if (!user || !habit || !time) return;
    
        try {
            const userDocRef = doc(db, "users", user.uid);
            const habitsCollectionRef = collection(userDocRef, "habits");
    
            await addDoc(habitsCollectionRef, {
                habit: habit,
                time: time.toString(), // Store time as a string for Firestore
                createdAt: new Date(),
            });
    
            await scheduleNotification(habit, time); // Schedule notification
    
            Alert.alert('Habit added and notification scheduled!');
            setHabit("");
            setTime(new Date()); // Reset to current time
        } catch (error) {
            console.error("Error adding habit: ", error);
            Alert.alert("Error adding habit: ", error.message);
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={{ width: '30%' }}
                placeholder='Enter Habit...'
                value={habit}
                onChangeText={setHabit} // Update the habit input state
            />
            <TouchableOpacity onPress={() => setShowPicker(true)}>
                <Text style={{ width: 40, textAlign: 'center' }}>
                    {time.toTimeString().slice(0, 5)} {/* Display selected time */}
                </Text>
            </TouchableOpacity>
            {showPicker && (
                <DateTimePicker
                    value={time}
                    mode="time" // Set the mode to time
                    is24Hour={true} // Use 24-hour format
                    display="default" // The display mode for the picker
                    onChange={(event, selectedDate) => {
                        const currentDate = selectedDate || time;
                        setShowPicker(false); // Hide the picker after selecting
                        setTime(currentDate); // Update time state
                    }}
                />
            )}
            <TouchableOpacity onPress={handleHabitAdd}>
                <Image style={{ width: 25, height: 25 }} source={add} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '98%',
        height: 60,
        alignItems: "center",
        borderRadius: 30,
        borderWidth: 1,
        marginTop: 20,
        padding: 15,
        flexDirection: "row",
        justifyContent: "space-between"
    }
});

export default AddHabits;
