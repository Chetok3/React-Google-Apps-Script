function hasTrigger(funcName: string): boolean {
  return ScriptApp.getProjectTriggers().some(
    (t) => t.getHandlerFunction() === funcName
  );
}
export function installCronTriggers() {
  if (!hasTrigger('syncEmployees')) {
    ScriptApp.newTrigger('syncEmployees').timeBased().everyHours(1).create();
  }
}
export default installCronTriggers;
