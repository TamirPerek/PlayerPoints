import {bootstrapApplication} from '@angular/platform-browser';
import * as Sentry from "@sentry/angular";
import {appConfig} from './app/app.config';
import {App} from './app/app';
import {isDevMode} from '@angular/core';
import { version as appVersion } from '../package.json'

Sentry.init({
  dsn: "https://6578d57c49e7014c9c7d0bd503069b28@o4510601228386304.ingest.de.sentry.io/4510601231204432",
  environment: isDevMode() ? 'development' : 'production',
  release: appVersion,
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: false,
  // This enables automatic instrumentation (highly recommended),
  // but is not necessary for purely manual usage
  // If you only want to use custom instrumentation:
  // * Remove the `BrowserTracing` integration
  // * add `Sentry.addTracingExtensions()` above your Sentry.init() call
  integrations: [
    Sentry.browserTracingIntegration(),
    // Add browser profiling integration to the list of integrations
    Sentry.browserProfilingIntegration(),
    Sentry.replayIntegration()
  ],
  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0 // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
