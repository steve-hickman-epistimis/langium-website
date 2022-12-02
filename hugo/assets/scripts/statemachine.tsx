import { MonacoEditorReactComp } from '@typefox/monaco-editor-react';
import React, { createRef, HtmlHTMLAttributes, Ref, RefObject } from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';

let dummyData = {
  events: ["switchCapacity", "next"],
  states: [
    {
      name: "PowerOff",
      next: "",
      switchCapacity: "RedLight"
    },
    {
      name: "GreenLight",
      next: "YellowLight",
      switchCapacity: "PowerOff"
    },
    {
      name: "YellowLight",
      next: "RedLight",
      switchCapacity: "PowerOff"
    },
    {
      name: "RedLight",
      next: "GreenLight",
      switchCapacity: "PowerOff"
    }
  ],
  initialState: "PowerOff"
}

let currentState;

interface StateProps {
  name: string;
  isActive: boolean;
  handleClick?;
}

interface EventProps {
  name: string;
  isEnabled: boolean;
  handleClick?;
}

class State extends React.Component<StateProps, StateProps> {
  private stateRef;
  constructor(props: StateProps) {
    super(props);
    this.state = {
      name: props.name,
      isActive: props.isActive
    }
    this.stateRef = React.createRef<HTMLInputElement>();
  }

  setActive(isItActiveBro: boolean) {
    this.setState({ isActive: isItActiveBro });
  }

  render() {
    return (
      <div className='cursor-default' onClick={this.props.handleClick} ref={this.stateRef}>
        {this.state.isActive ? (
          <div className="text-emeraldLangium border-2 border-solid border-emeraldLangium rounded-md p-4 text-center text-sm shadow-opacity-50 shadow-[0px_0px_15px_0px] shadow-emeraldLangium">
            {this.state.name}
          </div>
        ) : (
          <div className="border-2 text-emeraldLangiumDarker border-solid border-emeraldLangiumDarker rounded-md p-4 text-center text-sm">
            {this.state.name}
          </div>
        )}
      </div>
    );
  }
}

class Event extends React.Component<EventProps, EventProps> {
  constructor(props: EventProps) {
    super(props);
    this.state = {
      name: props.name,
      isEnabled: props.isEnabled,
    }
  }

  setEnabled(enabled: boolean) {
    this.setState({ isEnabled: enabled });
  }

  render() {
    return (
      <button onClick={this.props.handleClick} disabled={this.state.isEnabled} className="text-white border-2 border-solid bg-emeraldLangiumABitDarker rounded-md p-4 text-center text-sm enabled:hover:shadow-opacity-50 enabled:hover:shadow-[0px_0px_15px_0px] enabled:hover:shadow-emeraldLangium disabled:border-gray-400 disabled:text-gray-400 disabled:bg-emeraldLangiumDarker ">
        {this.props.name}
      </button>
    );
  }
}


function Preview() {
  let states: State[] = [];
  let events: Event[] = [];

  const changeStates = function(state: string) {
    states.forEach(item => {
      item.setActive(item.props.name === state);
    });
    currentState = state;
    events.forEach(event => {
      event.setEnabled(!getNextState(event.props.name));
    });
  }

  const getNextState = function(event: string): string {
    return dummyData.states.find(({ name }) => name === currentState)![event];
  }

  return (
    <div className="flex flex-col h-full w-full p-4 float-right items-center">
      <p className='text-white text-lg w-full my-4'>Events</p>
      <div className='flex flex-wrap w-full gap-2'>
        {dummyData.events.map((event, index) => {
          return <Event isEnabled={!getNextState(event)} handleClick={() => changeStates(getNextState(event))} name={event} key={index} ref={event => { events.push(event!) }}></Event>
        })}
      </div>
      <p className='text-white text-lg w-full my-4'>States</p>
      <div className='flex flex-wrap w-full gap-2 justify-start '>
        {dummyData.states.map((state, index) => {
          return <State handleClick={() => changeStates(state.name)} name={state.name} key={index} isActive={currentState == state.name} ref={state => { states.push(state!) }}></State>
        })}
      </div>
    </div>
  );
}

const syntaxHighlighting = {
  keywords: [
      'def','module'
  ],
  operators: [
      '-',',',';',':','*','/','+'
  ],
  symbols:  /-|,|;|:|\(|\)|\*|\/|\+/,

  tokenizer: {
      initial: [
          { regex: /[_a-zA-Z][\w_]*/, action: { cases: { '@keywords': {"token":"keyword"}, '@default': {"token":"ID"} }} },
          { regex: /[0-9]+(\.[0-9]*)?/, action: {"token":"number"} },
          { include: '@whitespace' },
          { regex: /@symbols/, action: { cases: { '@operators': {"token":"operator"}, '@default': {"token":""} }} },
      ],
      whitespace: [
          { regex: /\s+/, action: {"token":"white"} },
          { regex: /\/\*/, action: {"token":"comment","next":"@comment"} },
          { regex: /\/\/[^\n\r]*/, action: {"token":"comment"} },
      ],
      comment: [
          { regex: /[^\/\*]+/, action: {"token":"comment"} },
          { regex: /\*\//, action: {"token":"comment","next":"@pop"} },
          { regex: /[\/\*]/, action: {"token":"comment"} },
      ],
  }
};;

function App() {
  currentState = dummyData.initialState;
  return (
    <div className="w-full h-full border border-emeraldLangium justify-center self-center flex">
      <div className="float-left w-1/2 h-full border-r border-emeraldLangium">
        <div className="wrapper relative bg-white dark:bg-gray-900">
          <MonacoEditorReactComp languageId="statemachine" text="blah blah" syntax={syntaxHighlighting}/>
        </div>
      </div>
      <div className="float-right w-1/2 h-full" id="preview">
        <Preview />
      </div>
    </div>
  )
}

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <App />
); 