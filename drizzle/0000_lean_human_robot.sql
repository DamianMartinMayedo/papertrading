CREATE TABLE "executions" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" text NOT NULL,
	"portfolio_id" text NOT NULL,
	"instrument_id" text NOT NULL,
	"side" text NOT NULL,
	"quantity" numeric(24, 8) NOT NULL,
	"price" numeric(24, 8) NOT NULL,
	"executed_price" numeric(24, 8) NOT NULL,
	"commission" numeric(20, 8) NOT NULL,
	"slippage" numeric(20, 8) NOT NULL,
	"total" numeric(24, 8) NOT NULL,
	"executed_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "instruments" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"symbol" text NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'crypto' NOT NULL,
	"market" text DEFAULT 'crypto' NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"decimals" integer DEFAULT 8 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" text DEFAULT '{}',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "instruments_symbol_unique" UNIQUE("symbol")
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"portfolio_id" text NOT NULL,
	"instrument_id" text NOT NULL,
	"type" text NOT NULL,
	"side" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"quantity" numeric(24, 8) NOT NULL,
	"limit_price" numeric(24, 8),
	"stop_price" numeric(24, 8),
	"executed_at" timestamp with time zone,
	"executed_price" numeric(24, 8),
	"executed_quantity" numeric(24, 8),
	"strategy_version" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_snapshots" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"portfolio_id" text NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"cash" numeric(20, 2) NOT NULL,
	"positions_value" numeric(20, 2) NOT NULL,
	"total_value" numeric(20, 2) NOT NULL,
	"unrealized_pnl" numeric(20, 8) NOT NULL,
	"realized_pnl" numeric(20, 8) NOT NULL,
	"exposure" numeric(6, 4) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolios" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"initial_capital" numeric(20, 2) NOT NULL,
	"cash" numeric(20, 2) NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"mode" text DEFAULT 'manual' NOT NULL,
	"realism_level" integer DEFAULT 2 NOT NULL,
	"commission_fixed" numeric(10, 2) DEFAULT '0' NOT NULL,
	"commission_percent" numeric(6, 4) DEFAULT '0.001' NOT NULL,
	"slippage_percent" numeric(6, 4) DEFAULT '0.001' NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "positions" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"portfolio_id" text NOT NULL,
	"instrument_id" text NOT NULL,
	"side" text DEFAULT 'long' NOT NULL,
	"quantity" numeric(24, 8) NOT NULL,
	"average_price" numeric(24, 8) NOT NULL,
	"total_cost" numeric(24, 8) NOT NULL,
	"is_open" boolean DEFAULT true NOT NULL,
	"opened_at" timestamp with time zone NOT NULL,
	"closed_at" timestamp with time zone,
	"realized_pnl" numeric(20, 8),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "price_bars" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"instrument_id" text NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"open" numeric(24, 8) NOT NULL,
	"high" numeric(24, 8) NOT NULL,
	"low" numeric(24, 8) NOT NULL,
	"close" numeric(24, 8) NOT NULL,
	"volume" numeric(24, 8) NOT NULL,
	"source" text DEFAULT 'coingecko' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "executions" ADD CONSTRAINT "executions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executions" ADD CONSTRAINT "executions_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executions" ADD CONSTRAINT "executions_instrument_id_instruments_id_fk" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_instrument_id_instruments_id_fk" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_snapshots" ADD CONSTRAINT "portfolio_snapshots_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "positions" ADD CONSTRAINT "positions_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "positions" ADD CONSTRAINT "positions_instrument_id_instruments_id_fk" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_bars" ADD CONSTRAINT "price_bars_instrument_id_instruments_id_fk" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "executions_order_idx" ON "executions" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "executions_portfolio_idx" ON "executions" USING btree ("portfolio_id");--> statement-breakpoint
CREATE INDEX "executions_instrument_idx" ON "executions" USING btree ("instrument_id");--> statement-breakpoint
CREATE UNIQUE INDEX "instruments_symbol_idx" ON "instruments" USING btree ("symbol");--> statement-breakpoint
CREATE INDEX "orders_portfolio_idx" ON "orders" USING btree ("portfolio_id");--> statement-breakpoint
CREATE INDEX "orders_instrument_idx" ON "orders" USING btree ("instrument_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "portfolio_snapshots_portfolio_date_idx" ON "portfolio_snapshots" USING btree ("portfolio_id","date");--> statement-breakpoint
CREATE INDEX "portfolio_snapshots_date_idx" ON "portfolio_snapshots" USING btree ("date");--> statement-breakpoint
CREATE INDEX "positions_portfolio_idx" ON "positions" USING btree ("portfolio_id");--> statement-breakpoint
CREATE INDEX "positions_instrument_idx" ON "positions" USING btree ("instrument_id");--> statement-breakpoint
CREATE INDEX "positions_open_idx" ON "positions" USING btree ("is_open");--> statement-breakpoint
CREATE UNIQUE INDEX "price_bars_instrument_date_idx" ON "price_bars" USING btree ("instrument_id","date");--> statement-breakpoint
CREATE INDEX "price_bars_date_idx" ON "price_bars" USING btree ("date");