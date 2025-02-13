import styles from "./css/rcscout.module.css";

const RCScout = () => {
    return (
      <div>
        <div className={styles.rcScout} data-scout-rendered={true}>
          <p className={styles.rcScout__text}>
            <i className={styles.rcScout__logo}></i>
            Want to become a better programmer?
            <a className={styles.rcScout__link} href="https://www.recurse.com/scout/click?t=af9a73dda60f0a29147b1aaddbc4a088">
              Join the Recurse Center!</a>
          </p>
        </div>
      </div>);
    }

export default RCScout;
  