import { type } from '@testing-library/user-event/dist/type';
import React, { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react'

const HOST_API = "http://localhost:8080/api";

const initialState = {
  List: [],
  item: {}
};

const Store = createContext(initialState)

const Form = () => {
  const formRef = useRef(null);
  const { dispatch, state: { todo } } = useContext(Store);
  const item = todo.item;
  const [state, setState] = useState(item);

  const onAdd = (event) => {
    event.preventDefault();

    const request = {
      name: state.name,
      id: null,
      completed: false
    };


    fetch(HOST_API + "/todo", {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then((todo) => {
        dispatch({ type: "add-item", item: todo });
        setState({ name: "" });
        formRef.current.reset();
      });
  }

  const onEdit = (event) => {
    event.preventDefault();

    const request = {
      name: state.name,
      id: item.id,
      isCompleted: item.isCompleted
    };

    fetch(HOST_API+"/todo", {
      method: "PUT",
      body: JSON.stringify(request),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then((todo) => {
      dispatch({ type: "update-item", item: todo });
      setState({name: ""});
      formRef.current.reset();
    });
  }

  return <form ref={formRef}>
    <input type="text" name="name" defaultValue={item.name}onChange={(event) => {
      setState({ ...state, name: event.target.value })
    }} ></input>
    {item.id && <button onClick={onEdit}>Actualizar</button>}
    {!item.id && <button onClick={onAdd}>Agregar</button>}
    
  </form>
}

const List = () => {
  const { dispatch, state} = useContext(Store);

  useEffect(() => {
    fetch(HOST_API+"/todos")//Promesa
    .then(response => response.json())
    .then((List) => {
      dispatch({type: "update-list", List})
    })
  }, [state.List.length, dispatch]);

  const onDelete = (id) => {
    fetch(HOST_API + "/"+id+"/todo",{
      method: "DELETE"
    })
    .then((List) => {
      dispatch({ type: "delete-item", id})
    })
  };

  const onEdit = (todo) => {
    dispatch ({ type: "edit-item", item: todo})
  };

  return <div>
    <table>
    <thead>
      <tr>
        <td>ID</td>
        <td>Nombre</td>
        <td>¿Está completado?</td>
      </tr>
    </thead>
    <tbody>
      {this.List.map((todo) => {
        return <tr key={todo.id}>
          <td>{todo.id}</td>
          <td>{todo.name}</td>
          <td>{todo.isCompleted === true? "SI" : "NO"}</td>
          <td><button onClick={() => onDelete(todo.id)}>Eliminar</button></td>
          <td><button onClick={() => onEdit(todo)}>Editar</button></td>
        </tr>
      })}
    </tbody>
  </table>
  </div>
  
}

//Función puera que siempre recibe la misma entrada
function reducer(state, action) {
  switch (action, type) {
    case 'update-item':

    const listUpdateEdit = state.List.map((item) => {
      if(item.id === action.item.id){
        return action.item;
      }
      return item;
    });
    return { ...state, List: listUpdateEdit, item: {}}

    case 'delete-item':
      const listUpdate = state.List.filter((item) => {
        return item.id !== action.id;
      });
      return { ...state, List: listUpdate }
    case 'update-list':
      return { ...state, List: action.List}
    case 'edit-item':
        return { ...state, item: action.List}
    case 'add-item':
      const newList = state.List;
      newList.push(action.item);
      return { ...state, List: newList }
    default:
      return state;  
  }
}

//Sirve para conectar los componentes para conectarlos entre sí
const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return <Store.Provider value= {{ state, dispatch }}>
  </Store.Provider>

}

function App() {
  return <StoreProvider>
    <Form />
    <List />
  </StoreProvider>
}

export default App;
