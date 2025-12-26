import {bootstrapApplication} from '@angular/platform-browser';
import * as Sentry from "@sentry/angular";
import {appConfig} from './app/app.config';
import {App} from './app/app';

Sentry.init({
  dsn: "https://6578d57c49e7014c9c7d0bd503069b28@o4510601228386304.ingest.de.sentry.io/4510601231204432",
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
  ],
  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
