import React, { useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { theme } from './colors'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Fontisto } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';

const STORAGE_KEY = "@toDos"
const TAB_KEY = "@toDoTab"

export default function App() {
  const [working, setWorking] = useState(true)
  const [text, setText] = useState("")
  const [toDos, setToDos] = useState({})
  useEffect(() => {
    loadToDos()
    loadTabStatus()
  }, [])
  const work = async () => {
    setWorking(true)
    await AsyncStorage.setItem(TAB_KEY, 'work')
  }
  const travel = async () => {
    setWorking(false)
    await AsyncStorage.setItem(TAB_KEY, 'travel')
  }
  const loadTabStatus = async () => {
    const s = await AsyncStorage.getItem(TAB_KEY)
    if (s) {
      if (s === 'work') {
        work()
      } else {
        travel()
      }
    }
  }
  const onChangeText = (payload) => setText(payload)
  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  }
  const loadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY)
      if (s) {
        setToDos(JSON.parse(s))
      }
    } catch (e) {
    }
  }
  const addToDo = async () => {
    console.log('addToDo')
    if (text === "") {
      return
    }
    // save to do
    const newToDos = { ...toDos, [Date.now()]: { text, work: working, complete: false } }
    setToDos(newToDos)
    await saveToDos(newToDos)
    setText("")
  }
  const deleteToDo = (id) => async () => {
    Alert.alert("Delete To Do?", "Are you sure?", [
        { text: "Cancel" },
        {
          text: "I'm Sure",
          onPress: async () => {
            const newToDos = { ...toDos }
            delete newToDos[id]
            setToDos(newToDos)
            await saveToDos(newToDos)
        }
      },
    ])
    return
  }

  const completeToggleToDo = (id) => async () => {
    const newToDos = { ...toDos }
    newToDos[id].complete = !newToDos[id].complete
    setToDos(newToDos)
    await saveToDos(newToDos)
  }

  const updateToDoText = (id) => async () => {
    const newToDos = { ...toDos }
    newToDos[id].update = true
    setToDos(newToDos)
  }
  const onChangeUpdateText = async (payload, key) => {
    const newToDos = { ...toDos }
    newToDos[key].text = payload
    setToDos(newToDos)
    await saveToDos(newToDos)
  }
  const closeUpdateInput = (id) => async () => {
    const newToDos = { ...toDos }
    delete newToDos[id].update
    setToDos(newToDos)
    await saveToDos(newToDos)
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{ ...styles.btnText, color: working ? "white" : theme.grey }}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={{ ...styles.btnText, color: !working ? "white" : theme.grey }}>Travel</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        value={text}
        style={styles.input}
        placeholder={working ? "Add a To Do" : "Where do you want to go?"}
      />
      <ScrollView>
        {
          Object.keys(toDos).map(key => (
            toDos[key].work === working ? (
              <View style={styles.toDo} key={key}>
                <View style={styles.btnList}>
                  <TouchableOpacity style={{ marginRight: 10 }} onPress={completeToggleToDo(key)}>
                    <Fontisto name={ toDos[key].complete ? 'checkbox-active' : 'checkbox-passive'} size={18} color={theme.grey} />
                  </TouchableOpacity>
                  {
                    toDos[key].update
                      ? (<TextInput
                          style={styles.changeInput}
                          placeholder="Change To Do"
                          value={toDos[key].text}
                          onChangeText={e => onChangeUpdateText(e, key)}
                          onSubmitEditing={closeUpdateInput(key)}
                        />)
                      : (<Text
                          style={{
                            ...styles.toDoText,
                            color: toDos[key].complete ? theme.grey : "white",
                            textDecorationLine: toDos[key].complete ? "line-through" : "none"
                          }}
                        >
                          {toDos[key].text}
                        </Text>)
                  }
                </View>
                <View style={styles.btnList}>
                  <TouchableOpacity onPress={updateToDoText(key)}>
                    <Entypo name="pencil" size={20} color={theme.grey} />
                  </TouchableOpacity>
                  <TouchableOpacity style={{ marginLeft: 10 }} onPress={deleteToDo(key)}>
                    <Fontisto name="trash" size={18} color={theme.grey} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null
          ))
        }
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100
  },
  btnText: {
    fontWeight: "600",
    fontSize: 38
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500"
  },
  btnList: {
    flexDirection: "row",
    alignItems: "center"
  },
  changeInput: {
    backgroundColor: "#ffffff80",
    paddingVertical: 0,
    paddingHorizontal: 5,
    borderRadius: 4
  }
});
