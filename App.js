import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  Image,
  Switch,
  Button,
  FlatList,
} from "react-native";

export default function App() {
  const [locationName, setLocationName] = React.useState("Location Name");
  const [id, setId] = React.useState("12345");
  const [isGallons, setIsGallons] = useState(false);
  const toggleSwitch = () => setIsGallons((previousState) => !previousState);
  const generateKey = (pre) => {
    return `${pre}_${new Date().getTime()}`;
  };
  const [meterReadings, setReadings] = useState([
    { reading: "1234", key: generateKey("a") },
    { reading: "2345", key: generateKey("b") },
    { reading: "3456", key: generateKey("c") },
  ]);
  const [meterReadingList, setList] = useState(meterReadings);
  const [meterReadingInput, setReadingInput] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <Text>Enter Location: </Text>
      <TextInput
        style={styles.input}
        placeholder="Location Name"
        onChangeText={(text) => setLocationName(text)}
      />
      <Text>Enter Id: </Text>
      <TextInput
        style={styles.input}
        placeholder="Id"
        onChangeText={(text) => setId(text)}
      />
      <Text>Is Gallons</Text>
      <Switch
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        thumbColor={isGallons ? "#f5dd4b" : "#f4f3f4"}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleSwitch}
        value={isGallons}
      />
      <Text>Enter New Reading: </Text>
      <TextInput
        style={styles.input}
        placeholder="Reading"
        onChangeText={(text) => setReadingInput(text)}
        value={meterReadingInput}
      />
      <FlatList
        data={meterReadings}
        renderItem={({ item }) => {
          return (
            <View style={{ flexDirection: "row" }}>
              <Text>{item.reading}</Text>
              <Button
                onPress={() => {
                  const newList = meterReadings.filter(
                    (i) => item.key !== i.key
                  );
                  setReadings(newList);
                }}
                title="X"
                color="#841584"
              />
            </View>
          );
        }}
        keyExtractor={(item, index) => item.key}
      />
      <Button
        onPress={() => {
          var newReading = {};
          newReading.reading = meterReadingInput;
          newReading.key = generateKey(meterReadingInput);
          meterReadings.push(newReading);
          setReadingInput("");
        }}
        title="Submit"
        color="#841584"
      />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 50,
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#777",
    padding: 8,
    margin: 10,
    width: 200,
  },
});
