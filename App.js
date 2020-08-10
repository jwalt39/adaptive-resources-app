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
  YellowBox,
} from "react-native";
import { TapGestureHandler } from "react-native-gesture-handler";

const generateKey = (pre) => {
  return `${pre}_${new Date().getTime()}`;
};

class LocationEditScreen extends React.Component {
  constructor(props) {
    super(props);
    this.readings = props.route.params.location.readings;
    console.log("params: " + props.route.params.updateLocations);
    this.updateLocations = props.route.params.updateLocations;
    this.location = props.route.params.location;
    console.log(this.location);
    this.state = {
      readingInput: "",
      locationNameInput: this.location.locationName,
      locationIdInput: this.location.id,
      isGallonsInput: this.location.isGallons,
      readingsHolder: [],
    };
  }

  componentDidMount() {
    this.setState({ readingsHolder: [...this.readings] });
  }

  render() {
    const { navigation } = this.props;

    const setLocationName = (text) => {
      this.setState({ locationNameInput: text });
    };
    const setLocationId = (text) => {
      this.setState({ locationIdInput: text });
    };
    const toggleGallons = () => {
      var lastState = this.state.isGallonsInput;
      this.setState({ isGallonsInput: !lastState });
    };
    const setReadingInput = (text) => {
      this.setState({ readingInput: text });
    };
    const addReading = () => {
      var newReading = {};
      newReading.reading = this.state.readingInput;
      newReading.key = generateKey(newReading.reading);
      this.readings.push(newReading);
      console.log("newReading : " + newReading.reading);
      this.setState({ readingsHolder: [...this.readings] });
    };
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.inputView}>
          <Text style={styles.inputText}>Location: </Text>
          <TextInput
            style={styles.input}
            placeholder="Location Name"
            onChangeText={(text) => setLocationName(text)}
            defaultValue={this.state.locationNameInput}
            value={this.state.locationNameInput}
          />
          <Text style={styles.inputText}>ID: </Text>
          <TextInput
            style={styles.input}
            placeholder="Id"
            onChangeText={(text) => setLocationId(text)}
            defaultValue={this.state.locationIdInput}
            value={this.state.locationIdInput}
          />
          <Text style={styles.inputText}>Is Gallons:</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={this.state.isGallonsInput ? "#f5dd4b" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleGallons}
            defaultValue={this.state.isGallonsInput}
            value={this.state.isGallonsInput}
          />
          <Text style={styles.inputText}>Enter New Reading: </Text>
          <View style={styles.readingInput}>
            <TextInput
              style={styles.input}
              placeholder="Reading"
              onChangeText={(text) => setReadingInput(text)}
              value={this.state.readingInput}
            />
            <Button
              onPress={() => {
                addReading();
                setReadingInput("");
              }}
              title="Submit Reading"
              color="#3d5975"
            />
          </View>
          <FlatList
            data={this.state.readingsHolder}
            renderItem={({ item }) => {
              return (
                <View style={styles.locationListElementView}>
                  <Text style={styles.readingText}>{item.reading}</Text>
                  <Button
                    onPress={() => {
                      const newList = this.state.readings.filter(
                        (i) => item.key !== i.key
                      );
                      this.setState({ readingsHolder: [newList] });
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
              locationName: this.state.locationNameInput,
              id: this.state.locationIdInput,
              /*key:
                this.state.location.key === "" ||
                this.state.location.key === undefined
                  ? generateKey(this.state.location.id)
                  : this.state.location.key,*/
              readings: this.readings,
              isGallons: this.state.isGallonsInput,
            };
            console.log("update locations: " + this.updateLocations);
            saveLocation(newLocation, this.updateLocations, navigation);
          }}
          title="Finish"
          color="#3d5975"
        />
        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }
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
  constructor(props) {
    super(props);
    this.state = {
      isFetching: false,
      locations: [],
    };
  }

  updateLocations = function () {
    this.setState({ isFetching: true });
    fetch("https://l9yr8a51w6.execute-api.us-east-2.amazonaws.com/development")
      .then((response) => response.json())
      .then((json) => {
        var results = json.body.Items;
        for (var i = 0; i < results.length; i++) {
          console.log(results[i]);
          results[i].key = generateKey(results[i].id);
          console.log("hello? : " + results[i].readings);
          for (var k = 0; k < results[i].readings.length; k++) {
            var reading = results[i].readings[k];
            console.log(reading);
            if (reading === undefined) {
              continue;
            }
            results[i].readings[k] = {
              reading: reading,
              key: generateKey(results[i].id + reading),
            };
          }
        }
        this.setState({ isFetching: false, locations: results });
      });
  };

  componentDidMount() {
    this.updateLocations();
  }

  render() {
    const { navigation } = this.props;

    return (
      <SafeAreaView>
        <FlatList
          onRefresh={() => this.updateLocations()}
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
                  <Button
                    onPress={() => {
                      console.log("Opening : " + item.readings);
                      navigation.navigate("Edit Location", {
                        location: item,
                        updateLocations: this.updateLocations.bind(this),
                      });
                    }}
                    title="Edit"
                    color="#3d5975"
                  />
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
              updateLocations: this.updateLocations.bind(this),
            });
          }}
          title="New Location"
          color="#3d5975"
        />
      </SafeAreaView>
    );
  }
}

YellowBox.ignoreWarnings([
  "Non-serializable values were found in the navigation state",
  "Each child in a list should have a unique 'key' prop",
]);

async function saveLocation(location, updateLocations, navigation) {
  console.log("saving location : " + location.readings);
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

  updateLocations();
  navigation.navigate("Adaptive Resources Inc.");
}

class HomeScreen extends React.Component {
  static navigationOptions = {
    title: "Adaptive Resources Inc.",
  };

  render() {
    const { navigation } = this.props;
    return (
      <SafeAreaView style={styles.container}>
        <LocationList {...this.props} navigation={navigation} />
      </SafeAreaView>
    );
  }
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
