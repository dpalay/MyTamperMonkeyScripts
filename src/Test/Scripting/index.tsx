import {render, h} from 'preact'
import {useState} from 'preact/hooks'
import { Modal } from "../../shared/Modal"
console.log( 'test script is running from the file system instead of from TM...' );
const myModal = new Modal({withHeader: true, withPreact: true})
myModal.setPosition(100,20)

const PreactApp = () => {
    const [counter, setCounter] = useState(0)
    return (
    <div>
        Hello, World from Preact! {counter}
        <button onClick={() => setCounter(counter => counter+1)}>Count!</button>
    </div>)
}


render(<PreactApp/>, myModal.preactTarget() as HTMLDivElement )