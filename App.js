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
  toDoFunc: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  funcText: {
    color:"white",
    backgroundColor:theme.gray,
    padding: 5
  }
});

const TODO_STORAGE_KEY = "@toDos";
const WORK_STORAGE_KEY = "@working"

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDoText, setToDoText] = useState("");
  const [toDos, setToDos] = useState({});

  useEffect(() => {
    loadWorking();
    loadToDos();
    }, [])


  const work = () => {
    setWorking(true);
    saveWorking(true);
  };

  const travel = () => {
    setWorking(false);
    saveWorking(false);
  };

  const onChangeText = (payload) => setText(payload);
  const onChangeTodoText = (payload) => setToDoText(payload);

  const editToDoState = (key) => {
    const newToDos = { ...toDos};
    newToDos[key].editState = !newToDos[key].editState
    setToDos(newToDos);
  }

  const editToDo = (key) =>{
    if (toDoText === "") {
      return;
    }
    const newToDos = { ...toDos};
    newToDos[key].text = toDoText;
    newToDos[key].editState = false;
    setToDos(newToDos);
    saveToDos(newToDos)
    setToDoText("");
  }

  const checkToDo = (key) => {
    const newToDos = { ...toDos};
    newToDos[key].isCheck = !newToDos[key].isCheck;
    setToDos(newToDos);
    saveToDos(newToDos)
  }

  const addToDo = async () => {
    if (text === "") {
      return;
    }

    const newToDos = { ...toDos, [Date.now()]: { text, working, isCheck : false, editState : false } };

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


  const saveToDos = async (newToDos) => {
    await AsyncStorage.setItem("@toDos", JSON.stringify(newToDos))
  }

  const loadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(TODO_STORAGE_KEY);
      setToDos(JSON.parse(s));
    } catch (err) {
      alert(err)
    }

  }

  const saveWorking = async(working) => {
    await AsyncStorage.setItem("@working", JSON.stringify(working))
  }

  const loadWorking = async() => {
    try {
      const s = await AsyncStorage.getItem(WORK_STORAGE_KEY)
      console.log(s)
      setWorking(JSON.parse(s))
    } catch(err) {
      alert(err)
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
                {toDos[key].editState 
                  ? <TextInput
                      onSubmitEditing={()=>{editToDo(key)}}  
                      value={toDoText}
                      onChangeText={onChangeTodoText}
                      returnKeyType="done"
                      style={styles.toDoinput}
                      placeholder={"수정하셔"}
                    ></TextInput>
                  : <Text style={{...styles.toDoText, textDecorationLine: toDos[key].isCheck ? "line-through" : "none"}}>{toDos[key].text}</Text>
                }
                <View style={styles.toDoFunc}>
                  <TouchableOpacity onPress={() => {
                    checkToDo(key)
                  }}>
                    <Text style={{...styles.funcText, color : toDos[key].isCheck ? "white" : "red"}}>체크</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {
                    editToDoState(key)
                  }}>
                    <Text style={styles.funcText}>수정</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {
                    deleteToDo(key)
                  }}>
                    <Fontisto name="trash" size={18} color={theme.gray} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null
          )}
        </ScrollView>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}
