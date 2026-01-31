const initEnv = () => {
  const props = PropertiesService.getScriptProperties();
  if (props.getKeys().length === 0) {
    props.setProperties({
      ALTEGIO_COMPANY_ID: '',
      ALTEGIO_PARENT_TOKEN: '',
      ALTEGIO_USER_TOKEN: '',
    });
  }
};
export default initEnv;
