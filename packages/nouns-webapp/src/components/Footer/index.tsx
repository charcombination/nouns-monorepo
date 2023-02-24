import classes from './Footer.module.css';
import { Container } from 'react-bootstrap';
import { externalURL, ExternalURL } from '../../utils/externalURL';
import Link from '../Link';

const Footer = () => {
  const twitterURL = externalURL(ExternalURL.twitter);
  const discourseURL = externalURL(ExternalURL.discourse);

  return (
    <div className={classes.wrapper}>
      <Container className={classes.container}>
        <footer className={classes.footerSignature}>
          <Link text="Imprint" url={discourseURL} leavesPage={false} />
          <Link text="Twitter" url={twitterURL} leavesPage={true} />
        </footer>
      </Container>
    </div>
  );
};
export default Footer;
