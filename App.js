import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { theme } from "./colors";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Fontisto } from '@expo/vector-icons';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});

const STORAGE_KEY = "@toDos";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});

  useEffect(() => {
    loadToDos()
    }, [])


  const work = () => {
    setWorking(true);
  };

  const travel = () => {
    setWorking(false);
  };

  const onChangeText = (payload) => setText(payload);

  const addToDo = async () => {
    if (text === "") {
      return;
    }

    const newToDos = { ...toDos, [Date.now()]: { text, working } };

    setToDos(newToDos);
    await saveToDos(newToDos)
    setText("");
  };

  const deleteToDo = async (key) => {
    Alert.alert("할일을 삭제합니다", "정말로?", [
      {text : "취소"},
      {text : "확인", onPress: () => {
        const newToDos = {...toDos}
        delete newToDos[key];
        setToDos(newToDos);
         saveToDos(newToDos)
      }},
    ])
  }


  const saveToDos = async (toSabe) => {
    await AsyncStorage.setItem("@toDos", JSON.stringify(toSabe))
  }

  const loadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      setToDos(JSON.parse(s));
    } catch (error) {
      alert('애러발생')
    }

  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.gray }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.gray,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput
          onSubmitEditing={addToDo}
          returnKeyType="done"
          value={text}
          onChangeText={onChangeText}
          style={styles.input}
          placeholder={working ? "할 일을 추가하셔" : "어디로 가고 싶으셔"}
        ></TextInput>
        <ScrollView>
          {Object.keys(toDos).map((key) =>
            toDos[key].working === working ? (
              <View style={styles.toDo} key={key}>
                <Text style={styles.toDoText}>{toDos[key].text}</Text>
                <TouchableOpacity onPress={() => {
                  deleteToDo(key)
                }}>
                  <Fontisto name="trash" size={18} color={theme.gray} />
                </TouchableOpacity>
              </View>
            ) : null
          )}
        </ScrollView>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}
