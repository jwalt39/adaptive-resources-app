import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import "react-native-gesture-handler";

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  Switch,
  Button,
  FlatList,
  Platform,
} from "react-native";

const generateKey = (pre) => {
  console.log("generating new key");
  return `${pre}_${new Date().getTime()}`;
};

function LocationEditScreen({ route, navigation }) {
  const { location } = route.params;
  const [locationName, setLocationName] = React.useState(location.locationName);
  const [id, setId] = React.useState(location.locationId);
  const [isGallons, setIsGallons] = useState(location.isGallons);
  const toggleSwitch = () => setIsGallons((previousState) => !previousState);

  const [meterReadings, setReadings] = useState(location.readings);
  const [meterReadingInput, setReadingInput] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <Text>Enter Location: </Text>
      <TextInput
        style={styles.input}
        placeholder="Location Name"
        onChangeText={(text) => setLocationName(text)}
        defaultValue={location.locationName}
      />
      <Text>Enter Id: </Text>
      <TextInput
        style={styles.input}
        placeholder="Id"
        onChangeText={(text) => setId(text)}
        defaultValue={location.id}
      />
      <Text>Is Gallons</Text>
      <Switch
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        thumbColor={isGallons ? "#f5dd4b" : "#f4f3f4"}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleSwitch}
        value={isGallons}
        defaultValue={location.isGallons}
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
        title="Submit Reading"
        color="#841584"
      />
      <Button
        onPress={() => {
          var newLocation = {
            locationName: locationName,
            id: id,
            key:
              location.key === "" || location.key === undefined
                ? generateKey(locationName)
                : location.key,
            readings: meterReadings,
            isGallons: isGallons,
          };
          console.log(locationName);
          var locationFound = false;
          for (var i = 0; i < global.locations.length; i++) {
            if (locations[i].key === location.key) {
              global.locations[i] = newLocation;
              locationFound = true;
              break;
            }
          }
          if (!locationFound) {
            global.locations.push(newLocation);
          }
          for (var index = 0; index < global.locations.length; ++index) {
            console.log(global.locations[index]);
          }
          console.log("locations : " + global.locations.length);
          navigation.navigate("Home");
        }}
        title="Finish"
        color="#841584"
      />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

global.locations = [
  {
    locationName: "locationName",
    id: "1234566",
    key: generateKey("a"),
    readings: [
      { reading: "1234", key: generateKey("a") },
      { reading: "2345", key: generateKey("b") },
      { reading: "3456", key: generateKey("c") },
    ],
    isGallons: true,
  },
];

function HomeScreen({ route, navigation }) {
  const [locationList, setLocationList] = useState(global.locations);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        contentContainerStyle={{ flexGrow: 1 }}
        data={locationList}
        renderItem={({ item }) => {
          console.log("home : " + item);
          return (
            <View style={styles.locationListElementView}>
              <View style={styles.locationNameView}>
                <Text style={styles.locationName}>{item.locationName}</Text>
              </View>
              <View style={styles.locationButtonView}>
                <Button
                  onPress={() => {
                    editLocation = global.locations.find((loc) => {
                      return loc.key === item.key;
                    });
                    navigation.navigate("Edit Location", {
                      location: editLocation,
                    });
                  }}
                  title="Edit"
                  color="#841584"
                />
                <Button
                  onPress={() => {
                    const newList = global.locations.filter(
                      (i) => item.key !== i.key
                    );

                    global.locations = newList;
                    setLocationList(global.locations);
                  }}
                  title="Delete"
                  color="#841584"
                />
              </View>
            </View>
          );
        }}
        keyExtractor={(item, index) => item.key}
      />
      <Button
        onPress={() => {
          var newLocation = {
            locationName: "",
            id: "",
            key: "",
            readings: [],
            isGallons: false,
          };
          navigation.navigate("Edit Location", {
            location: newLocation,
          });
        }}
        title="New Location"
        color="#841584"
      />
    </SafeAreaView>
  );
}

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Edit Location" component={LocationEditScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: "2%",
    flex: 1,
    backgroundColor: "#fff",
    alignSelf: "stretch",
  },
  input: {
    borderWidth: 1,
    borderColor: "#777",

    width: 200,
  },
  locationName: {
    fontSize: 30,
    fontFamily: Platform.OS === "ios" ? "AppleSDGothicNeo-Thin" : "Roboto",
    textAlign: "center",
    textAlignVertical: "center",
    height: "100%",
    width: "100%",
  },
  locationListElementView: {
    paddingLeft: "2%",
    flex: 2,
    alignSelf: "flex-start",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  locationButtonView: {
    alignSelf: "flex-end",
    width: "25%",
  },
});
