import { h, render } from 'preact'
const preactContainer = document.createElement('div')
preactContainer.id = 'preactContainer'
document.body.appendChild(preactContainer)

const PreactTest = () => {
	return (<div 
		style={{ 
			position: 'fixed', 
			top: '50%', 
			left: '50%', 
			transform: 'translate(-50%, -50%)', 
			backgroundColor: '#f0f0f0', 
			border: '1px solid black', 
			borderRadius: '5px', 
			padding: '10px' }}>
				Test
			</div>)
}

render(<PreactTest />, preactContainer)