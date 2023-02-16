import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import classes from './App.module.css';
import '../src/css/globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Footer from './components/Footer';
import Playground from './pages/Playground';

function App() {
  return (
    <div className={`${classes.wrapper}`}>
      <BrowserRouter>
          <Switch>
            <Route exact path="/" component={Playground} />
            <Route component={Playground} />
          </Switch>
          <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
