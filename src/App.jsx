import * as React from 'react';
import axios from 'axios';

const welcome = {
    greeting: 'Hey',
    title: 'React',
}

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

const useStorageState = (key, initialState) => {
    const [value, setValue] = React.useState(
        localStorage.getItem(key) || initialState
    );

    React.useEffect(() => {
        localStorage.setItem(key, value);
    }, [value, key]);

    return [value, setValue];
};

const storiesReducer = (state, action) => {
    switch (action.type) {
        case 'STORIES_FETCH_INIT':
            return {
                ...state,
                isLoading: true,
                isError: false,
            };
        case 'STORIES_FETCH_SUCCESS':
            return {
                ...state,
                isLoading: false,
                isError: false,
                data: action.payload,
            };
        case 'STORIES_FETCH_FAILURE':
            return {
                ...state,
                isLoading: false,
                isError: true,
            };
        case 'REMOVE_STORY':
            return {
                ...state,
                data: state.data.filter(
                    (story) => action.payload.objectID !== story.objectID
                ),
            };
        default:
            throw new Error();
    }
};

const SearchForm = ({ searchTerm, onSearchInput, searchAction,}) => (
    <form action={searchAction}>
        <InputWithLabel
            id="search"
            value={searchTerm}
            isFocused
            onInputChange={onSearchInput}
        >
            <strong>Search:</strong>
        </InputWithLabel>

        <button type="submit" disabled={!searchTerm}>
            Submit
        </button>
    </form>
);


function App() {

    console.log('App renders');

    //const [stories, setStories] = React.useState([]);
    const [stories, dispatchStories] = React.useReducer(
        storiesReducer,
        { data: [], isLoading: false, isError: false }
    );


    const [searchTerm, setSearchTerm] = useStorageState('search', 'React');

    const [url, setUrl] = React.useState(
        `${API_ENDPOINT}${searchTerm}`
    );

    const searchAction = () => {
        setUrl(`${API_ENDPOINT}${searchTerm}`);
        //event.preventDefault();
    };




    const handleSearchInput = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleFetchStories = React.useCallback(async () => {
        //if (!searchTerm) return;
        dispatchStories({type: 'STORIES_FETCH_INIT'});

        try {
            const result = await axios.get(url);

            dispatchStories({
                type: 'STORIES_FETCH_SUCCESS',
                payload: result.data.hits,
            });
        } catch {
            dispatchStories({
                type: 'STORIES_FETCH_FAILURE',
            });
        }
    }, [url]);

    React.useEffect(() => {
        handleFetchStories();
    }, [handleFetchStories]);

    const handleRemoveStory = (item) => {
      //  const newStories = stories.filter(
      //      (story) => story.objectID !== item.objectID
      //  );

        dispatchStories({
            type: 'REMOVE_STORY',
            payload: item,
        });
    };


   // const handleSearch = (event) => {
    //    console.log('handleSearch:')
    //    console.log(event.target.value);
    //    setSearchTerm(event.target.value);

    //};

  return (
      <div>
        <h1>{welcome.greeting} {welcome.title}</h1>

          <SearchForm
              searchTerm={searchTerm}
              onSearchInput={handleSearchInput}
              searchAction={searchAction}
          />

        <hr />

        {stories.isError && <p>Something went wrong ...</p>}

        {stories.isLoading ? (
            <p>Loading...</p>
        ) : (
            <List list={stories.data} onRemoveItem={handleRemoveStory}/>
        )}

      </div>

  );
}

const InputWithLabel = ({ id, value, type = 'text', onInputChange, children, }) => (
<>
    <label htmlFor={id}>{children}: </label>
    &nbsp;
    <input
        id={id}
        type={type}
        value={value}
        onChange={onInputChange}
    />
</>
);
/*
const Search = ( {search, onSearch} ) => {

    console.log('Search renders');

    const handleOnBlur = (event) => {
        console.log(event);
    }
    return (
        <>
            <label htmlFor="search">Search: </label>
            <input
                id="search"
                type="text"
                value={search} onChange={onSearch}
                onBlur={handleOnBlur}
            />
        </>
    );
}
*/

const List = ({ list, onRemoveItem }) => (
        <ul>
            {list.map((item) => (
                <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem}/>
            ))}
        </ul>
    );

const Item = ( { item, onRemoveItem }) => {
    const handleRemoveItem = () => {
        onRemoveItem(item);
    };

    return (
    <li>
        <span>
            <a href={item.url}>{item.title}</a>
        </span>
        &nbsp;<span>{item.author}</span>
        &nbsp;<span>{item.num_comments}</span>
        &nbsp;<span>{item.points}</span>
        &nbsp;<span>
                 <button type="button" onClick={handleRemoveItem}>Dismiss</button>
              </span>
    </li>
    );
};

export default App;
