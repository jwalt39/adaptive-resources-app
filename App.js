import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import "react-native-gesture-handler";

import { NavigationContainer, useNavigation } from "@react-navigation/native";
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
  return `${pre}_${new Date().getTime()}`;
};

function LocationEditScreen({ route, navigation }) {
  const { location } = route.params;
  const [locationName, setLocationName] = React.useState(location.locationName);
  const [id, setId] = React.useState(location.id);
  const [isGallons, setIsGallons] = useState(location.isGallons);
  const toggleSwitch = () => setIsGallons((previousState) => !previousState);

  const [meterReadings, setReadings] = useState(location.readings);
  const [meterReadingInput, setReadingInput] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputView}>
        <Text style={styles.inputText}>Location: </Text>
        <TextInput
          style={styles.input}
          placeholder="Location Name"
          onChangeText={(text) => setLocationName(text)}
          defaultValue={location.locationName}
        />
        <Text style={styles.inputText}>ID: </Text>
        <TextInput
          style={styles.input}
          placeholder="Id"
          onChangeText={(text) => setId(text)}
          defaultValue={location.id}
        />
        <Text style={styles.inputText}>Is Gallons:</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isGallons ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isGallons}
          defaultValue={location.isGallons}
        />
        <Text style={styles.inputText}>Enter New Reading: </Text>
        <View style={styles.readingInput}>
          <TextInput
            style={styles.input}
            placeholder="Reading"
            onChangeText={(text) => setReadingInput(text)}
            value={meterReadingInput}
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
            color="#3d5975"
          />
        </View>
        <FlatList
          data={meterReadings}
          renderItem={({ item }) => {
            return (
              <View style={styles.locationListElementView}>
                <Text style={styles.readingText}>{item.reading}</Text>
                <Button
                  onPress={() => {
                    const newList = meterReadings.filter(
                      (i) => item.key !== i.key
                    );
                    setReadings(newList);
                  }}
                  title="X"
                  color="#875823"
                />
              </View>
            );
          }}
          keyExtractor={(item, index) => item.key}
        />
      </View>
      <Button
        onPress={() => {
          var newLocation = {
            locationName: locationName,
            id: id,
            key:
              location.key === "" || location.key === undefined
                ? generateKey(location.id)
                : location.key,
            readings: meterReadings,
            isGallons: isGallons,
          };
          saveLocation(newLocation, navigation);
        }}
        title="Finish"
        color="#3d5975"
      />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

function GoToEditLocation({ location }) {
  const navigation = useNavigation();
  return (
    <Button
      onPress={() => {
        console.log("Opening : " + location.readings);
        navigation.navigate("Edit Location", {
          location: location,
        });
      }}
      title="Edit"
      color="#3d5975"
    />
  );
}

function deleteLocation(location) {
  fetch("https://l9yr8a51w6.execute-api.us-east-2.amazonaws.com/development/", {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: location.id,
    }),
  }).then((response) => {});
}

class LocationList extends React.Component {
  state = {
    isFetching: false,
    locations: [],
  };

  componentDidMount() {
    this.updateList();
  }

  updateList = () => {
    this.setState({ isFetching: true, locations: [] });
    fetch("https://l9yr8a51w6.execute-api.us-east-2.amazonaws.com/development")
      .then((response) => response.json())
      .then((json) => {
        var results = json.body.Items;
        for (var i = 0; i < results.length; i++) {
          console.log(results[i]);
          results[i].key = generateKey(results[i].id);
          console.log("hello? : " + results[i].readings);
          for (var k = 0; k < results[i].readings.length; k++) {
            console.log("2");
            var reading = results[i].readings[k];
            console.log(reading);
            if (reading === undefined) {
              continue;
            }
            console.log("3");
            results[i].readings[k] = {
              reading: reading,
              key: generateKey(results[i].id + reading),
            };
          }
        }
        this.setState({ isFetching: false, locations: results });
      });
  };

  render() {
    return (
      <FlatList
        onRefresh={() => this.updateList()}
        refreshing={this.state.isFetching}
        contentContainerStyle={{ flexGrow: 1 }}
        data={this.state.locations}
        renderItem={({ item }) => {
          console.log("home : " + item);
          return (
            <View style={styles.locationListElementView}>
              <View style={styles.locationNameView}>
                <Text style={styles.locationName}>{item.locationName}</Text>
              </View>
              <View style={styles.locationButtonView}>
                <GoToEditLocation location={item} />
                <Button
                  onPress={() => {
                    deleteLocation(item);
                    const newList = this.state.locations.filter(
                      (i) => item.key !== i.key
                    );
                    this.setState({
                      isFetching: false,
                      locations: newList,
                    });
                  }}
                  title="Delete"
                  color="#875823"
                />
              </View>
            </View>
          );
        }}
        keyExtractor={(item, index) => item.key}
      />
    );
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function saveLocation(location, navigation) {
  console.log("saving location : " + location.id);
  let response = await fetch(
    "https://l9yr8a51w6.execute-api.us-east-2.amazonaws.com/development/",
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        locationName: location.locationName,
        id: location.id,
        readings: location.readings.map((r) => r.reading),
        isGallons: location.isGallons,
      }),
    }
  ).then((response) => {
    console.log(JSON.stringify(response));
  });

  navigation.navigate("Adaptive Resources Inc.");
}

function HomeScreen({ route, navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <LocationList />
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
        color="#3d5975"
      />
    </SafeAreaView>
  );
}

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Adaptive Resources Inc." component={HomeScreen} />
        <Stack.Screen name="Edit Location" component={LocationEditScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    color: "#516a83",
    textAlignVertical: "center",
    height: "100%",
    width: "100%",
  },
  inputView: {
    flexGrow: 1,
    flex: 1,
    backgroundColor: "#fff",
    alignSelf: "stretch",
    padding: 5,
  },
  inputText: {
    fontSize: 30,
    fontFamily: Platform.OS === "ios" ? "AppleSDGothicNeo-Thin" : "Roboto",
  },
  locationListElementView: {
    flex: 2,
    backgroundColor: "#f7f7f7",
    paddingLeft: "1%",
    margin: 1,
    alignSelf: "flex-start",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  readingInput: {
    flexDirection: "row",
    alignContent: "stretch",
  },
  readingText: {
    fontSize: 22,
    textAlignVertical: "center",
  },
  locationButtonView: {
    alignSelf: "flex-end",
    width: "25%",
  },
  button: {
    color: "#3d5975",
  },
});
