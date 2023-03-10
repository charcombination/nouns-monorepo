import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import classes from './App.module.css';
import '../src/css/globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Footer from './components/Footer';
import Playground from './pages/Playground';
import PlaygroundMobile from './pages/Playground Mobile';
import { isMobileScreen } from './utils/isMobile';

function App() {
  return (
    <div className={`${classes.wrapper}`}>
      <BrowserRouter>
          <Switch>
            <Route exact path="/" component={isMobileScreen() ? PlaygroundMobile : Playground} />
            <Route component={Playground} />
          </Switch>
          <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
