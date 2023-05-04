#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include <emscripten.h>
#include <rime_api.h>

enum TraitsEnum {
  SHARED_DATA_DIR,
  USER_DATA_DIR,
  DISRIBUTION_NAME,
  DISTRIBUTION_CODE_NAME,
  DISTRIBUTION_VERSION,
  APP_NAME,
  MODULES,
  MIN_LOG_LEVEL,
  LOG_DIR,
  PREBUILT_DATA_DIR,
  STAGING_DIR
};

uintptr_t create_traits() {
  RIME_STRUCT(RimeTraits, traits);
  return traits;
}

void set_traits(RimeTraits *traits, TraitsEnum trait, void *value) {
  switch(trait) {
    case SHARED_DATA_DIR:
      traits->shared_data_dir = (char *)value;
      break;
    case USER_DATA_DIR:
      traits->user_data_dir = (char *)value;
      break;
    case DISRIBUTION_NAME:
      traits->distribution_name = (char *)value;
      break;
    case DISTRIBUTION_CODE_NAME:
      traits->distribution_code_name = (char *)value;
      break;
    case DISTRIBUTION_VERSION:
      traits->distribution_version = (char *)value;
      break;
    case APP_NAME:
      traits->app_name = (char *)value;
    case MODULES:
      traits->modules = (char **)value;
      break;
    case MIN_LOG_LEVEL:
      traits->min_log_level = (int)value;
      break;
    case LOG_DIR:
      traits->log_dir = (char *)value;
      break;
    case PREBUILT_DATA_DIR:
      traits->prebuilt_data_dir = (char *)value;
      break;
    case STAGING_DIR:
      traits->log_dir = (char *)value;
      break;
    default:
      break;
  }
}

void destory_traits(RimeTraits *traits) {
  free(traits);
}

int update_scheme(RimeTraits *traits) {
  RimeSetup(traits);
  RimeInitialize(NULL);

  Bool full_check = True;
  if (RimeStartMaintenance(full_check)) {
    RimeJoinMaintenanceThread();
  }

  RimeFinalize();
  return 1;
}

RimeContext *get_context(RimeSessionId session_id) {
  RIME_STRUCT(RimeContext, context);
  Bool get_context_status = RimeGetContext(session_id, &context);

  if (get_context_status) {
    return context;
  }
  return NULL;
}

Bool free_context(RimeContext *context) {
  return RimeFreeContext(context);
}

char *get_commit_text(RimeSessionId session_id) {
  RIME_STRUCT(RimeCommit, commit);
  if (RimeGetCommit(session_id, &commit)) {
    char newCommit[strlen(commit.text) + 1];
    strcpy(newCommit, commit.text);
    RimeFreeCommit(&commit);
    return newCommit;
  }
  return NULL;
}