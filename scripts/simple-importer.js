Hooks.on('renderJournalDirectory', (directory, html) => {
    // add custom button
    let actionButtonsHeaderRow = html.find('div.header-actions');
    actionButtonsHeaderRow.append(`<button id="import-journal-data-button"><i class="fas fa-book"></i> Import Journal Data</button>`);

    html.on('click', '#import-journal-data-button', (event) => {
        SimpleImporter.importJournalDataConfig.render(true);
    });
});

Hooks.on('init', () => SimpleImporter.initialise());

/**
 * Represents the simple-importer module.
 */
class SimpleImporter {
    /**
     * The id of the module.
     */
    static MODULE_ID = 'simple-importer';

    /**
     * The handlebar templates for the module.
     */
    static TEMPLATES = {
        /**
         * The template for ImportJournalDataConfig.
         */
        DATA_IMPORT: `modules/${this.MODULE_ID}/templates/data-import.hbs`
    }

    /**
     * Initialises the module.
     */
    static initialise() {
        this.importJournalDataConfig = new ImportJournalDataConfig();
    }
}

/**
 * The form for importing journal data.
 */
class ImportJournalDataConfig extends FormApplication {
    /**
     * Retrieves the default options for the form.
     */
    static get defaultOptions() {
        let overrides = {
            height: 'auto',
            id: 'import-journal-data',
            template: SimpleImporter.TEMPLATES.DATA_IMPORT,
            title: 'Import Journal Data'
        };

        return foundry.utils.mergeObject(super.defaultOptions, overrides);
    }

    /**
     * Subscribes event handlers for the form.
     * @param {*} html The html of the form.
     */
    activateListeners(html) {
        super.activateListeners(html);

        html.on('click', '#import-button', this._handleImportButtonClick.bind(this));
    }

    /**
     * Invoked when the import button is clicked.
     * @param {*} event The event data.
     */
    async _handleImportButtonClick(event) {
        // ensure data was supplied
        const importData = $(event.currentTarget).siblings('textarea').val();
        if (!importData)
            return;

        // ensure the data is valid json
        let input;
        try {
            input = JSON.parse(importData);
        }
        catch (exception) {
            ui.notifications.error('Failed to parse JSON, error printed in console.');
            console.error(SimpleImporter.MODULE_ID, '|', exception);
            return;
        }

        // validate journal entries
        let entriesValid = true;
        const isArray = Array.isArray(input);
        if (isArray) {
            if (input.length == 0) {
                ui.notifications.error('Array contains no entries.')
                entriesValid = false;
            }

            for (let entry of input)
                if (!this.validateEntry(entry))
                    entriesValid = false;
        }
        else
            if (!this.validateEntry(input))
                entriesValid = false;

        if (!entriesValid) {
            ui.notifications.error('Aborting import, fix issues and try again.');
            return;
        }
    
        // import journal entries
        if (isArray)
            for (let entry of input)
                await JournalEntry.create(entry);
        else
            await JournalEntry.create(input);

        ui.notifications.info('Journal entries successfully created.');
        await SimpleImporter.importJournalDataConfig.close();
    }

    /**
     * Checks to see whether a journal entry is valid.
     * @param {JournalEntryData} entry The journal entry to ensure is valid.
     * @returns true, if the entry is valid; otherwise, false.
     */
    validateEntry(entry) {
        const isValid = entry.name && /\S/.test(entry.name);
        if (!isValid)
            ui.notifications.error(`Entry: "${JSON.stringify(entry)}" is invalid (must have populated "name" field).`);

        return isValid;
    }
}